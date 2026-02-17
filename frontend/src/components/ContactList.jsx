import React, { useState } from 'react'
import api from '../services/api.js'
import styles from './ContactList.module.css'

const FILTERS = [
  { key: 'all',    label: 'Tous' },
  { key: 'unread', label: 'Non lus' },
  { key: 'read',   label: 'Lus' },
]

export default function ContactList({ contacts, selectedContact, onSelect, onContactAdded }) {
  const [showAdd, setShowAdd]             = useState(false)
  const [search, setSearch]               = useState('')
  const [filter, setFilter]               = useState('all')
  const [addInput, setAddInput]           = useState('')
  const [addError, setAddError]           = useState('')
  const [addLoading, setAddLoading]       = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching]         = useState(false)

  // ── Recherche utilisateurs ─────────────────────────────────────────────────
  const handleSearch = async (value) => {
    setAddInput(value)
    setAddError('')
    if (value.trim().length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const { data } = await api.get(`/contacts/search?q=${encodeURIComponent(value.trim())}`)
      setSearchResults(data || [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // ── Ajouter un contact ─────────────────────────────────────────────────────
  const handleAdd = async (contactId) => {
    setAddError('')
    setAddLoading(true)
    try {
      await api.post(`/contacts/add/${contactId}`)
      await onContactAdded()
      setAddInput('')
      setSearchResults([])
      setShowAdd(false)
    } catch (err) {
      setAddError(err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'ajout")
    } finally {
      setAddLoading(false)
    }
  }

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const safeContacts = (contacts || []).filter(c => c && c.username)

  const filtered = safeContacts
    .filter((c) => c.username.toLowerCase().includes((search || '').toLowerCase()))
    .filter((c) => {
      if (filter === 'unread') return c.unreadCount > 0
      if (filter === 'read')   return c.unreadCount === 0
      return true
    })

  return (
    <div className={styles.container}>

      {/* ── Barre recherche + bouton ajout ── */}
      <div className={styles.searchRow}>
        <input
          className={`input ${styles.searchInput}`}
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={`btn btn-primary ${styles.addBtn}`}
          onClick={() => { setShowAdd(v => !v); setAddError(''); setAddInput(''); setSearchResults([]) }}
          title="Ajouter un contact"
        >
          {showAdd ? '✕' : '+'}
        </button>
      </div>

      {/* ── Filtres Tous / Non lus / Lus ── */}
      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'unread' && safeContacts.filter(c => c.unreadCount > 0).length > 0 && (
              <span className={styles.filterBadge}>
                {safeContacts.filter(c => c.unreadCount > 0).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Formulaire ajout contact ── */}
      {showAdd && (
        <div className={`${styles.addForm} fade-in`}>
          <input
            className="input"
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={addInput}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          {searching && <p className={styles.addHint}>Recherche...</p>}
          {addError  && <p className={styles.addError}>{addError}</p>}
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  className={styles.searchResultItem}
                  onClick={() => handleAdd(user.id)}
                  disabled={addLoading}
                >
                  <div className={styles.itemAvatar}>
                    {user.avatar && user.avatar.startsWith('/uploads')
                      ? <img src={user.avatar} alt={user.username}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : user.username?.[0]?.toUpperCase() ?? '?'
                    }
                  </div>
                  <span>{user.username}</span>
                  <span className={styles.addIcon}>+</span>
                </button>
              ))}
            </div>
          )}
          {addInput.length >= 2 && !searching && searchResults.length === 0 && (
            <p className={styles.addHint}>Aucun utilisateur trouvé</p>
          )}
        </div>
      )}

      {/* ── Liste des contacts ── */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {filter === 'unread' ? 'Aucun message non lu 🎉'
              : filter === 'read' ? 'Aucune conversation lue'
              : search ? 'Aucun résultat'
              : 'Aucun contact — ajoutez-en un !'}
          </p>
        ) : (
          filtered.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              selected={selectedContact?.id === contact.id}
              onSelect={() => onSelect(contact)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ContactItem({ contact, selected, onSelect }) {
  return (
    <button
      className={`${styles.item} ${selected ? styles.itemSelected : ''} ${contact.unreadCount > 0 ? styles.itemUnread : ''}`}
      onClick={onSelect}
    >
      <div className={styles.itemAvatar}>
        {contact.avatar && contact.avatar.startsWith('/uploads')
          ? <img src={contact.avatar} alt={contact.username}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : contact.username?.[0]?.toUpperCase() ?? '?'
        }
      </div>
      <div className={styles.itemInfo}>
        <span className={styles.itemName}>{contact.username}</span>
        {contact.lastMessage && (
          <span className={styles.itemPreview}>{contact.lastMessage}</span>
        )}
      </div>
      {contact.unreadCount > 0 && (
        <span className="badge">{contact.unreadCount}</span>
      )}
    </button>
  )
}