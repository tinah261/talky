import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { getCurrentUser, logout } from '../services/auth.js'
import { getToken } from '../services/auth.js'
import api from '../services/api.js'
import ContactList  from '../components/ContactList.jsx'
import ChatWindow   from '../components/ChatWindow.jsx'
import MessageInput   from '../components/MessageInput.jsx'
import ProfileModal   from '../components/ProfileModal.jsx'
import styles from './Home.module.css'

export default function Home() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const stompClient = useRef(null)

  const [contacts,        setContacts]        = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages,        setMessages]        = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showProfile,    setShowProfile]    = useState(false)

  // ── Charger contacts + conversations et fusionner ──────────────────────────
  const fetchContacts = useCallback(async () => {
    try {
      const [{ data: contactsData }, { data: convsData }] = await Promise.all([
        api.get('/contacts'),
        api.get('/messages/conversations').catch(() => ({ data: [] })),
      ])

      // Construire une map contactId → { unreadCount, lastMessage }
      const convMap = {}
      ;(convsData || []).forEach((conv) => {
        const contactId = conv.contact?.id
        if (!contactId) return
        const lastMsg = conv.lastMessage
        const isMine  = lastMsg?.sender?.id === currentUser?.id
        convMap[contactId] = {
          unreadCount: conv.unreadCount ?? 0,
          lastMessage: lastMsg?.content
            ? (isMine ? `Vous : ${lastMsg.content}` : lastMsg.content)
            : null,
        }
      })

      // Normaliser les contacts et injecter les données de conversation
      const normalized = (contactsData || []).map((c) => {
        const user  = c.contact ?? c
        const extra = convMap[user.id] || { unreadCount: 0, lastMessage: null }
        return {
          id:          user.id,
          username:    user.username,
          email:       user.email,
          avatar:      user.avatar,
          isOnline:    user.isOnline ?? false,
          isBlocked:   c.isBlocked  ?? false,
          unreadCount: extra.unreadCount,
          lastMessage: extra.lastMessage,
        }
      }).filter(Boolean)

      setContacts(normalized)
    } catch (e) {
      console.error('fetchContacts error', e)
    }
  }, [currentUser?.id])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  // ── Charger les messages d'une conversation ────────────────────────────────
  useEffect(() => {
    if (!selectedContact) { setMessages([]); return }

    const fetchMessages = async () => {
      setLoadingMessages(true)
      try {
        const { data } = await api.get(`/messages/conversation/${selectedContact.id}`)
        setMessages(data || [])
        await api.put(`/messages/read/${selectedContact.id}`).catch(() => {})
        setContacts(prev =>
          prev.map(c => c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c)
        )
      } catch (e) {
        console.error('fetchMessages error', e)
      } finally {
        setLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [selectedContact])

  // ── WebSocket STOMP ────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken()
    const client = new Client({
      webSocketFactory: () => new window.SockJS('http://localhost:8080/ws'),
      connectHeaders:   { Authorization: `Bearer ${token}` },
      reconnectDelay:   5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (frame) => {
          const msg      = JSON.parse(frame.body)
          const senderId = msg.sender?.id ?? msg.senderId

          setSelectedContact(curr => {
            if (curr && senderId === curr.id) {
              setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev
                return [...prev, msg]
              })
              api.put(`/messages/read/${curr.id}`).catch(() => {})
            } else {
              setContacts(prev =>
                prev.map(c =>
                  c.id === senderId
                    ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: msg.content }
                    : c
                )
              )
            }
            return curr
          })
        })
      },
      onStompError: frame => console.error('STOMP error', frame),
    })

    client.activate()
    stompClient.current = client
    return () => { client.deactivate() }
  }, [])

  // ── Envoyer un message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content) => {
    if (!selectedContact || !content.trim()) return
    try {
      const { data } = await api.post(`/messages/send/${selectedContact.id}`, {
        content: content.trim(),
      })
      setMessages(prev => [...prev, data])
      // Mettre à jour lastMessage localement
      setContacts(prev =>
        prev.map(c =>
          c.id === selectedContact.id
            ? { ...c, lastMessage: `Vous : ${content.trim()}` }
            : c
        )
      )
    } catch (e) {
      console.error('sendMessage error', e)
    }
  }, [selectedContact])

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>💬</span>
            <span className={styles.brandName}>Talky</span>
          </div>
          <div className={styles.userChip}>
            <span
              className={styles.avatar}
              onClick={() => setShowProfile(true)}
              title="Modifier le profil"
              style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
            >
              {currentUser?.avatar && currentUser.avatar.startsWith('/uploads')
                ? <img src={currentUser.avatar} alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : currentUser?.username?.[0]?.toUpperCase() ?? '?'
              }
            </span>
            <span className={styles.username}>{currentUser?.username}</span>
            <button
              className={`btn btn-ghost ${styles.logoutBtn}`}
              onClick={logout}
              title="Déconnexion"
            >↪</button>
          </div>
        </header>

        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelect={setSelectedContact}
          onContactAdded={fetchContacts}
          currentUser={currentUser}
        />
      </aside>

      <main className={styles.main}>
        {selectedContact ? (
          <>
            <div className={styles.chatHeader}>
              <span className={styles.chatAvatar} style={{ overflow: 'hidden', padding: 0 }}>
                {selectedContact.avatar && selectedContact.avatar.startsWith('/uploads')
                  ? <img src={selectedContact.avatar} alt={selectedContact.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : selectedContact.username?.[0]?.toUpperCase()
                }
              </span>
              <div>
                <p className={styles.chatName}>{selectedContact.username}</p>
                <p className={styles.chatStatus}>
                  {selectedContact.isOnline ? ' En ligne' : ' Hors ligne'}
                </p>
              </div>
            </div>

            <ChatWindow
              messages={messages}
              currentUser={currentUser}
              loading={loadingMessages}
              onMessageUpdated={(updated) => {
                setMessages(prev =>
                  prev.map(m => m.id === updated.id ? updated : m)
                )
              }}
            />

            <MessageInput onSend={sendMessage} />
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyTitle}>Sélectionne un contact</p>
            <p className={styles.emptyDesc}>
              Choisis une conversation à gauche pour commencer à chatter.
            </p>
          </div>
        )}
      </main>

      {showProfile && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onUpdated={(updated) => {
            const stored = JSON.parse(localStorage.getItem('talky_user') || '{}')
            const merged = { ...stored, ...updated }
            localStorage.setItem('talky_user', JSON.stringify(merged))
            setCurrentUser(merged)
          }}
        />
      )}
    </div>
  )
}