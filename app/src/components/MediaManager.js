import React, { useState, useEffect } from 'react';
import { getMediaItems } from '../mediaOperations';

function MediaManager() {
  const [mediaItems, setMediaItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      const data = await getMediaItems();
      setMediaItems(data.results);
    } catch (error) {
      console.error('Error fetching media items:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = async (id) => {
    // Implement delete functionality
    console.log('Delete item with id:', id);
  };

  const handleSave = async () => {
    // Implement save functionality
    console.log('Save edited item:', editingItem);
    setEditingItem(null);
  };

  return (
    <div className="media-manager">
      <h2>Media Manager</h2>
      <ul>
        {mediaItems.map(item => (
          <li key={item.id}>
            {editingItem && editingItem.id === item.id ? (
              <>
                <input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                />
                <button onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                {item.title}
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MediaManager;
