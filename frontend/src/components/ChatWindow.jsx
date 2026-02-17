import React, { useEffect, useRef, useState } from 'react'
import api from '../services/api.js'
import styles from './ChatWindow.module.css'

export default function ChatWindow({ messages, currentUser, loading, onMessageUpdated }) {
  const bottomRef    = useRef(null)
  const windowRef    = useRef(null)
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (!messages.length) return
    const isFirstLoad = prevCountRef.current === 0
    prevCountRef.current = messages.length

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (windowRef.current) {
          windowRef.current.scrollTop = windowRef.current.scrollHeight
        }
      })
    })
  }, [messages])

  if (loading) {
    return <div className={styles.center}><span className="spinner" /></div>
  }

  if (!messages || messages.length === 0) {
    return (
      <div className={styles.center}>
        <p className={styles.noMessages}>Aucun message — écrivez le premier !</p>
      </div>
    )
  }

  const groups = groupByDate(messages)

  return (
    <div className={styles.window} ref={windowRef}>
      {groups.map((group) => (
        <div key={group.date}>
          <div className={styles.dateDivider}><span>{group.date}</span></div>
          {group.messages.map((msg) => {
            const senderId = msg.sender?.id ?? msg.senderId
            const isMine   = senderId === currentUser?.id
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={isMine}
                onMessageUpdated={onMessageUpdated}
              />
            )
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function MessageBubble({ msg, isMine, onMessageUpdated }) {
  const [showMenu,  setShowMenu]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [editText,  setEditText]  = useState(msg.content)
  const [loading,   setLoading]   = useState(false)
  const menuRef = useRef(null)

  const time   = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : ''
  const isRead    = msg.isRead    ?? msg.read    ?? false
  const isDeleted = msg.isDeleted ?? false
  const isEdited  = !!msg.editedAt

  // Fermer le menu si clic ailleurs
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Supprimer ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setShowMenu(false)
    setLoading(true)
    try {
      const { data } = await api.delete(`/messages/${msg.id}`)
      onMessageUpdated?.(data)
    } catch (e) {
      console.error('delete error', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Modifier ───────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editText.trim() || editText === msg.content) { setEditing(false); return }
    setLoading(true)
    try {
      const { data } = await api.put(`/messages/${msg.id}`, { content: editText.trim() })
      onMessageUpdated?.(data)
      setEditing(false)
    } catch (e) {
      console.error('edit error', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.row} ${isMine ? styles.rowMine : styles.rowOther} fade-in`}>
      {!isMine && (
        <div className={styles.avatar}>
          {msg.sender?.avatar && msg.sender.avatar.startsWith('/uploads')
            ? <img src={msg.sender.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : (msg.sender?.username ?? '?')[0].toUpperCase()
          }
        </div>
      )}

      <div className={styles.bubbleWrap}>
        {/* Menu contextuel — seulement sur mes messages non supprimés */}
        {isMine && !isDeleted && (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              className={styles.menuTrigger}
              onClick={() => setShowMenu(v => !v)}
              title="Options"
            >⋯</button>
            {showMenu && (
              <div className={`${styles.contextMenu} fade-in`}>
                <button className={styles.menuItem} onClick={() => { setEditing(true); setShowMenu(false) }}>
                  ✏️ Modifier
                </button>
                <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleDelete}>
                  🗑️ Supprimer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulle */}
        {editing ? (
          <div className={styles.editWrap}>
            <textarea
              className={styles.editInput}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() }
                if (e.key === 'Escape') { setEditing(false); setEditText(msg.content) }
              }}
              autoFocus
            />
            <div className={styles.editActions}>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => { setEditing(false); setEditText(msg.content) }}>Annuler</button>
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={handleEdit} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Sauvegarder'}
              </button>
            </div>
          </div>
        ) : (
          <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther} ${isDeleted ? styles.bubbleDeleted : ''}`}>
            {isDeleted
              ? <span className={styles.deletedText}>🚫 Ce message a été supprimé</span>
              : msg.content
            }
          </div>
        )}

        <div className={`${styles.meta} ${isMine ? styles.metaMine : ''}`}>
          <span className={styles.time}>{time}</span>
          {isEdited && !isDeleted && <span className={styles.edited}>modifié</span>}
          {isMine && (
            <span className={`${styles.readStatus} ${isRead ? styles.read : ''}`}>
              {isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function groupByDate(messages) {
  const map = {}
  messages.forEach((msg) => {
    const label = dateLabel(msg.createdAt)
    if (!map[label]) map[label] = []
    map[label].push(msg)
  })
  return Object.entries(map).map(([date, msgs]) => ({ date, messages: msgs }))
}

function dateLabel(iso) {
  if (!iso) return 'Inconnu'
  const d         = new Date(iso)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(d, today))     return "Aujourd'hui"
  if (isSameDay(d, yesterday)) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate()
}