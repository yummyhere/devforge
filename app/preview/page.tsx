"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Github, Check, X, UploadCloud, ExternalLink, Key, FolderGit2, Info } from "lucide-react";
import { buildProjectScaffold } from "@/lib/projectScaffold";

const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8F8F0] text-[#88857D] gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#C87858] border-t-transparent animate-spin"></div>
      <p className="text-sm font-medium text-[#282824]">Loading Fullscreen Live Preview...</p>
    </div>
  ),
});

export default function PreviewPage() {
  const [code, setCode] = useState<string>("");
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [githubToken, setGithubToken] = useState<string>("");
  const [repoName, setRepoName] = useState<string>("");
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  // User Progress UI State
  const [pushProgressStatus, setPushProgressStatus] = useState<string>("");
  const [pushProgressPercent, setPushProgressPercent] = useState<number>(0);

  useEffect(() => {
    const storedCode = localStorage.getItem("devforge_preview_code");
    if (storedCode) {
      setCode(storedCode);
    }
    const savedToken = localStorage.getItem("devforge_github_pat");
    if (savedToken) setGithubToken(savedToken);
  }, []);

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = githubToken.trim();
    if (!token || !repoName.trim() || isPushing) return;

    setIsPushing(true);
    setPushError(null);
    setPushSuccessUrl(null);
    setPushProgressPercent(0);
    setPushProgressStatus("Authenticating with GitHub...");
    localStorage.setItem("devforge_github_pat", token);

    try {
      const cleanRepo = repoName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");

      const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_")
        ? `Bearer ${token}`
        : `token ${token}`;

      // 1. Fetch authenticated user's profile to get exact GitHub username
      setPushProgressStatus("Authenticating user with GitHub...");
      setPushProgressPercent(5);
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
      });

      if (!userRes.ok) {
        throw new Error("Invalid GitHub Personal Access Token. Please verify your token and scope permissions.");
      }

      const userData = await userRes.json();
      const username = userData.login;

      // 2. Check if repository exists on the user's account
      setPushProgressStatus("Verifying GitHub repository...");
      setPushProgressPercent(10);
      let defaultBranch = "main";
      const repoRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}`, {
        headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
      });

      if (repoRes.status === 404) {
        // Repository 404 Not Found -> Automatically create it using POST /user/repos
        setPushProgressStatus("Creating repository on GitHub...");
        setPushProgressPercent(15);
        const createRes = await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            name: cleanRepo,
            private: false,
            auto_init: true,
            description: "Generated with DevForge AI",
          }),
        });

        if (!createRes.ok && createRes.status !== 422) {
          const errData = await createRes.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to create repository on GitHub (${createRes.status})`);
        }
      } else if (repoRes.ok) {
        const repoData = await repoRes.json();
        if (repoData.default_branch) defaultBranch = repoData.default_branch;
      }

      // 3. Generate complete codebase scaffold files dictionary
      setPushProgressStatus("Building complete project scaffold...");
      setPushProgressPercent(20);
      const scaffoldFiles = buildProjectScaffold(cleanRepo, code);
      const entries = Object.entries(scaffoldFiles);
      const totalFiles = entries.length;

      // 4. Step A: Create Git Blobs (POST /repos/{owner}/{repo}/git/blobs)
      const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

      for (let i = 0; i < entries.length; i++) {
        const [filePath, content] = entries[i];
        const percent = 20 + Math.round(((i + 1) / totalFiles) * 50);
        setPushProgressStatus(`Pushing ${totalFiles} files... Step A: Creating blob ${i + 1}/${totalFiles} (${filePath})`);
        setPushProgressPercent(percent);

        const base64Content = btoa(unescape(encodeURIComponent(content)));
        const blobRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/blobs`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            content: base64Content,
            encoding: "base64",
          }),
        });

        if (!blobRes.ok) {
          const blobErr = await blobRes.json().catch(() => ({}));
          throw new Error(blobErr.message || `Failed to create blob for ${filePath}`);
        }

        const blobData = await blobRes.json();
        treeItems.push({
          path: filePath,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        });
      }

      // 5. Step B: Get latest parent commit & Create Git tree (POST /repos/{owner}/{repo}/git/trees)
      setPushProgressStatus(`Pushing ${totalFiles} files... Step B: Creating Git tree...`);
      setPushProgressPercent(75);

      let latestCommitSha: string | undefined;
      let baseTreeSha: string | undefined;

      const refRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/ref/heads/${defaultBranch}`, {
        headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
      });

      if (refRes.ok) {
        const refData = await refRes.json();
        latestCommitSha = refData.object?.sha;

        if (latestCommitSha) {
          const commitRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/commits/${latestCommitSha}`, {
            headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
          });
          if (commitRes.ok) {
            const commitData = await commitRes.json();
            baseTreeSha = commitData.tree?.sha;
          }
        }
      }

      const treePayload: any = { tree: treeItems };
      if (baseTreeSha) treePayload.base_tree = baseTreeSha;

      const treeRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/trees`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify(treePayload),
      });

      if (!treeRes.ok) {
        const treeErr = await treeRes.json().catch(() => ({}));
        throw new Error(treeErr.message || "Failed to create Git tree");
      }

      const treeData = await treeRes.json();
      const newTreeSha = treeData.sha;

      // 6. Step C: Create Git commit (POST /repos/{owner}/{repo}/git/commits)
      setPushProgressStatus(`Pushing ${totalFiles} files... Step C: Creating Git commit...`);
      setPushProgressPercent(88);

      const commitRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/commits`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: "Commit full project scaffold from DevForge AI",
          tree: newTreeSha,
          parents: latestCommitSha ? [latestCommitSha] : [],
        }),
      });

      if (!commitRes.ok) {
        const commitErr = await commitRes.json().catch(() => ({}));
        throw new Error(commitErr.message || "Failed to create Git commit");
      }

      const commitData = await commitRes.json();
      const newCommitSha = commitData.sha;

      // 7. Step D: Update branch ref (PATCH /repos/{owner}/{repo}/git/refs/heads/main)
      setPushProgressStatus(`Pushing ${totalFiles} files... Step D: Updating default branch ref...`);
      setPushProgressPercent(95);

      const updateRefRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/refs/heads/${defaultBranch}`, {
        method: "PATCH",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      });

      if (!updateRefRes.ok) {
        await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/refs`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            ref: `refs/heads/${defaultBranch}`,
            sha: newCommitSha,
          }),
        });
      }

      setPushProgressStatus("Complete!");
      setPushProgressPercent(100);
      const targetUrl = `https://github.com/${username}/${cleanRepo}`;
      setPushSuccessUrl(targetUrl);
    } catch (err: any) {
      const msg = err.message || "Failed to push repository to GitHub";
      if (msg.toLowerCase().includes("resource not accessible")) {
        setPushError(
          "GitHub Permission Error: Your token lacks the required permissions. Please generate a 'Tokens (classic)' with the 'repo' checkbox selected, or for Fine-grained tokens set 'Contents: Read and write' with access to 'All repositories'."
        );
      } else {
        setPushError(msg);
      }
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] text-[#282824] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-[#E8E0D0] bg-[#F0E8E0] px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-[#282824] text-base tracking-tight">DevForge Live Preview</span>
          <span className="px-2.5 py-0.5 text-[11px] bg-[#75A86B]/15 text-[#75A86B] border border-[#75A86B]/30 rounded-full font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#75A86B] animate-pulse"></span>
            Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#C87858] hover:bg-[#D98A68] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            <span>Push to GitHub</span>
          </button>

          <button
            onClick={() => window.close()}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#F0F0E8] hover:bg-[#E8E0D0] text-[#282824] border border-[#D8D8D0] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Close Tab</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Sandbox Area */}
      <main className="flex-1 p-4 flex flex-col">
        <SandpackPreview code={code} previewOnly={true} />
      </main>

      {/* Push to GitHub Modal Popup */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 bg-[#282824]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#F0E8E0] rounded-3xl border border-[#E8E0D0] shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsGithubModalOpen(false)}
              className="absolute top-4 right-4 text-[#88857D] hover:text-[#282824] text-xs font-bold w-8 h-8 rounded-full bg-[#F0F0E8] flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-[#E8E0D0] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#282824] text-white flex items-center justify-center shadow-md">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#282824]">Push to GitHub</h3>
                <p className="text-xs text-[#88857D]">Deploy generated code to your GitHub account</p>
              </div>
            </div>

            {pushSuccessUrl ? (
              <div className="p-4 rounded-2xl bg-[#75A86B]/15 border border-[#75A86B]/30 text-[#282824] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#75A86B]">
                  <Check className="w-4 h-4 text-[#75A86B]" />
                  <span>Code Pushed Successfully!</span>
                </div>
                <p className="text-xs text-[#88857D]">Your full codebase has been pushed to GitHub repository:</p>
                <div className="flex items-center gap-2 bg-[#F0F0E8] p-2 rounded-xl border border-[#75A86B]/40">
                  <input
                    type="text"
                    readOnly
                    value={pushSuccessUrl}
                    className="flex-1 text-xs text-[#282824] outline-none bg-transparent font-mono"
                  />
                </div>
                <a
                  href={pushSuccessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-[#75A86B] hover:bg-[#68995e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>Open GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <form onSubmit={handlePushToGithub} className="space-y-4">
                {/* Step-by-step PAT Instructions Box */}
                <div className="p-3.5 rounded-2xl bg-[#F0F0E8] border border-[#E8E0D0] text-xs text-[#282824] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#282824] font-bold">
                    <Info className="w-4 h-4 text-[#C87858] shrink-0" />
                    <span>How to generate your GitHub PAT:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#88857D] pl-1">
                    <li>Go to GitHub → Settings → Developer Settings → Personal Access Tokens.</li>
                    <li>Generate a token and ensure the <strong className="text-[#282824] font-semibold">'repo' scope</strong> (Full control of repositories) is checked.</li>
                  </ol>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#282824] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#C87858]" />
                    <span>GitHub Personal Access Token (PAT) *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F0F0E8] border border-[#E8E8E8] text-sm text-[#282824] placeholder-[#88857D] outline-none focus:border-[#C87858] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#282824] flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#C87858]" />
                    <span>Repository Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="e.g. my-awesome-web-app"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F0F0E8] border border-[#E8E8E8] text-sm text-[#282824] placeholder-[#88857D] outline-none focus:border-[#C87858] transition"
                  />
                </div>

                {isPushing && (
                  <div className="space-y-2 p-3.5 bg-[#F0F0E8] border border-[#E8E0D0] rounded-2xl animate-in fade-in">
                    <div className="flex justify-between items-center text-xs font-semibold text-[#282824]">
                      <span className="truncate pr-2">{pushProgressStatus}</span>
                      <span className="font-mono text-[11px] text-[#C87858] font-bold shrink-0">{pushProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-[#E8E0D0] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#C87858] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pushProgressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {pushError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    ⚠️ {pushError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!githubToken.trim() || !repoName.trim() || isPushing}
                  className="w-full py-3 bg-[#C87858] hover:bg-[#D98A68] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-[#C87858]/20"
                >
                  {isPushing ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Pushing Full Project...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Push Code to GitHub</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
