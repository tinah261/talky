import React, { useRef, useEffect } from 'react';
import styles from './EmojiPicker.module.css';

const EMOJIS = [
  { category: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'] },
  { category: 'Gestes', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🤳'] },
  { category: 'Cœurs', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'] },
  { category: 'Animaux', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️'] },
  { category: 'Nourriture', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🌽', '🥕', '🍟', '🍕', '🍔', '🌮', '🍣', '🍫', '🍿', '🍩', '🍪', '🍺', '☕'] }
];

export default function EmojiPicker({ onSelect, onClose }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Si on clique en dehors du menu, on déclenche la fermeture
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    // On utilise un timeout pour éviter que le clic d'ouverture ne ferme le menu instantanément
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      className={styles.picker} 
      ref={pickerRef} 
      onClick={(e) => e.stopPropagation()} // Empêche le clic dans le menu de fermer le menu
    >
      <div className={styles.categories}>
        {EMOJIS.map(({ category, emojis }) => (
          <div key={category} className={styles.category}>
            <div className={styles.categoryLabel}>{category}</div>
            <div className={styles.emojiGrid}>
              {emojis.map((emoji, idx) => (
                <button
                  key={`${category}-${idx}`}
                  className={styles.emojiBtn}
                  onClick={() => onSelect(emoji)}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}