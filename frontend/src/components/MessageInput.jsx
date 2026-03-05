import React, { useState, useRef } from 'react';
import EmojiPicker from './EmojiPicker.jsx';
import styles from './MessageInput.module.css';

export default function MessageInput({ onSend, receiverId, stompClient }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    // On remet le focus sur l'input après avoir ajouté l'emoji
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    
    // Auto-resize
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }

    // Signal "en train d'écrire"
    if (stompClient && receiverId && e.target.value.trim()) {
      try {
        stompClient.publish({
          destination: `/app/typing/${receiverId}`,
          body: JSON.stringify({ typing: true })
        });
      } catch (err) {}
    }
  };

  return (
    <div className={styles.bar}>
      {/* Affichage du sélecteur */}
      {showEmoji && (
        <EmojiPicker 
          onSelect={addEmoji} 
          onClose={() => setShowEmoji(false)} 
        />
      )}

      <div className={styles.inputWrap}>
        <button 
          type="button"
          className={styles.emojiBtn}
          onClick={(e) => {
            e.stopPropagation(); // Empêche la fermeture immédiate du menu
            setShowEmoji(!showEmoji);
          }}
          title="Ajouter un emoji"
        >
          😊
        </button>

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Écrire un message…"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>

      <button
        className={`btn btn-primary ${styles.sendBtn}`}
        onClick={handleSend}
        disabled={!text.trim()}
        title="Envoyer (Entrée)"
      >
        <SendIcon />
      </button>
    </div>
  );
}

// Icône d'envoi agrandie
function SendIcon() {
  return (
    <svg 
      width="22" 
      height="22" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ transform: 'translateX(1px)' }} // Petit décalage optique pour le centrage
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}