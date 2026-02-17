# ============================================================
# Script : crée tous les fichiers .module.css manquants
# Usage  : depuis D:/java/talky/frontend, exécute ce script
# ============================================================

$base = "D:/java/talky/frontend/src"

# ── ChatWindow.module.css ────────────────────────────────────
@"
.window {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.noMessages {
  color: var(--text-muted);
  font-size: 14px;
}

.dateDivider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 10px;
}

.dateDivider::before,
.dateDivider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.dateDivider span {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 3px;
}

.rowMine  { flex-direction: row-reverse; }
.rowOther { flex-direction: row; }

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a5fc8, var(--accent));
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 18px;
}

.avatarHidden { visibility: hidden; }

.bubbleWrap {
  max-width: 62%;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
}

.bubbleMine {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubbleOther {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 2px;
}

.metaMine { justify-content: flex-end; }

.time {
  font-size: 11px;
  color: var(--text-muted);
}

.readStatus {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  transition: color var(--transition);
}

.read {
  color: var(--accent);
}
"@ | Set-Content "$base/components/ChatWindow.module.css" -Encoding UTF8

# ── ContactList.module.css ───────────────────────────────────
@"
.container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 12px 10px 0;
}

.searchRow {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.searchInput {
  flex: 1;
  padding: 9px 12px !important;
  font-size: 13px !important;
}

.addBtn {
  padding: 9px 14px !important;
  font-size: 16px !important;
  flex-shrink: 0;
  border-radius: var(--radius-md) !important;
}

.addForm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-focus);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
}

.addError {
  font-size: 12px;
  color: var(--danger);
}

.list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 2px;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  padding: 32px 12px;
  line-height: 1.6;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
  color: var(--text-primary);
}

.item:hover {
  background: var(--bg-hover);
  border-color: var(--border);
}

.itemSelected {
  background: var(--accent-glow) !important;
  border-color: var(--border-focus) !important;
}

.itemAvatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a5fc8, var(--accent));
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.itemInfo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.itemName {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.itemPreview {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
"@ | Set-Content "$base/components/ContactList.module.css" -Encoding UTF8

# ── MessageInput.module.css ──────────────────────────────────
@"
.bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.inputWrap {
  flex: 1;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition), box-shadow var(--transition);
  overflow: hidden;
}

.inputWrap:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.textarea {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 11px 16px;
  color: var(--text-primary);
  font-family: var(--font-main);
  font-size: 14px;
  line-height: 1.55;
  resize: none;
  overflow-y: auto;
  max-height: 140px;
  min-height: 42px;
}

.textarea::placeholder { color: var(--text-muted); }

.sendBtn {
  width: 42px !important;
  height: 42px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  flex-shrink: 0;
  transition: all var(--transition) !important;
}

.sendBtn:hover:not(:disabled) {
  transform: scale(1.08) !important;
}

.sendBtn:disabled {
  background: var(--bg-hover) !important;
  color: var(--text-muted) !important;
  box-shadow: none !important;
}
"@ | Set-Content "$base/components/MessageInput.module.css" -Encoding UTF8

# ── Auth.module.css ──────────────────────────────────────────
@"
.wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
}

.blob1, .blob2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.blob1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(91,143,255,0.12) 0%, transparent 70%);
  top: -100px;
  left: -80px;
}

.blob2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(91,143,255,0.07) 0%, transparent 70%);
  bottom: -80px;
  right: -60px;
}

.card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px 36px;
  box-shadow: var(--shadow-md), 0 0 40px rgba(91,143,255,0.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.logoIcon { font-size: 28px; line-height: 1; }

.logoText {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 28px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}

.error {
  font-size: 13px;
  color: var(--danger);
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.18);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
}

.successMsg {
  font-size: 13px;
  color: var(--success);
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.18);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
}

.switch {
  margin-top: 22px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition);
}

.link:hover { color: #7aa5ff; }
"@ | Set-Content "$base/pages/Auth.module.css" -Encoding UTF8

# ── Home.module.css ──────────────────────────────────────────
@"
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-primary);
}

.sidebar {
  width: 300px;
  min-width: 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.sidebarHeader {
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand { display: flex; align-items: center; gap: 8px; }
.brandIcon { font-size: 20px; }

.brandName {
  font-family: var(--font-mono);
  font-size: 17px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.3px;
}

.userChip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.username {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logoutBtn {
  padding: 4px 8px !important;
  font-size: 13px !important;
  border-radius: var(--radius-sm) !important;
  flex-shrink: 0;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

.chatHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.chatAvatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #7aa5ff);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chatName {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.chatStatus { font-size: 12px; color: var(--success); }

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  padding: 40px;
  text-align: center;
}

.emptyIcon { font-size: 52px; opacity: 0.3; margin-bottom: 8px; }

.emptyTitle {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-secondary);
}

.emptyDesc {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 260px;
  line-height: 1.6;
}
"@ | Set-Content "$base/pages/Home.module.css" -Encoding UTF8

Write-Host ""
Write-Host "✅ Tous les fichiers CSS ont été créés :" -ForegroundColor Green
Write-Host "   src/components/ChatWindow.module.css"
Write-Host "   src/components/ContactList.module.css"
Write-Host "   src/components/MessageInput.module.css"
Write-Host "   src/pages/Auth.module.css"
Write-Host "   src/pages/Home.module.css"
Write-Host ""
Write-Host "👉 Lance maintenant : npm install && npm run dev" -ForegroundColor Cyan