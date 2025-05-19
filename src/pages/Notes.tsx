import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToNotes, 
  addNote, 
  updateNote, 
  deleteNote,
  Note,
  ChecklistItem,
  toggleChecklistItem
} from '../services/noteService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Available colors for notes
const noteColors = [
  { id: 'default', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
  { id: 'red', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  { id: 'amber', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  { id: 'green', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
];

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('default');
  const [isCheckList, setIsCheckList] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToNotes(user, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  const createNewNote = () => {
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setSelectedColor('default');
    setIsCheckList(false);
    setChecklistItems([]);
    setNewItemText('');
    
    // Create a new empty note with default values
    const newNote: Omit<Note, 'id'> = {
      title: '',
      content: '',
      color: 'default',
      isCheckList: false,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    if (!user) return;
    
    addNote(user, newNote)
      .then((id) => {
        const fullNote: Note = { id, ...newNote };
        setEditingNote(fullNote);
        toast.success('New note created');
      })
      .catch((error) => {
        console.error('Error creating note:', error);
        toast.error('Failed to create note');
      });
  };
  
  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewTitle(note.title);
    setNewContent(note.content);
    setSelectedColor(note.color);
    setIsCheckList(note.isCheckList);
    setChecklistItems(note.items || []);
  };
  
  const saveNote = async () => {
    if (!user || !editingNote) return;
    
    const updatedNote: Note = {
      ...editingNote,
      title: newTitle,
      content: newContent,
      color: selectedColor,
      isCheckList: isCheckList,
      items: checklistItems,
      updatedAt: Date.now(),
    };
    
    try {
      await updateNote(user, updatedNote);
      setEditingNote(null);
      toast.success('Note saved');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };
  
  const deleteNoteHandler = async (note: Note) => {
    if (!user) return;
    
    try {
      await deleteNote(user, note.id);
      if (editingNote?.id === note.id) {
        setEditingNote(null);
      }
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };
  
  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false,
    };
    
    setChecklistItems([...checklistItems, newItem]);
    setNewItemText('');
  };
  
  const removeChecklistItem = (itemId: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== itemId));
  };
  
  const toggleChecked = async (itemId: string, checked: boolean) => {
    if (!user || !editingNote) return;
    
    try {
      // Update local state immediately for UI responsiveness
      setChecklistItems(
        checklistItems.map(item => 
          item.id === itemId ? { ...item, checked } : item
        )
      );
      
      // Update in database
      await toggleChecklistItem(user, editingNote.id, itemId, checked);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      toast.error('Failed to update checklist item');
    }
  };
  
  // Function to get the color classes for a note
  const getNoteColorClasses = (colorId: string) => {
    const color = noteColors.find(c => c.id === colorId) || noteColors[0];
    return `${color.bg} ${color.border}`;
  };
  
  const renderNoteEditor = () => {
    if (!editingNote) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingNote.id ? 'Edit Note' : 'New Note'}
            </h2>
            <button
              onClick={() => setEditingNote(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-grow">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note Title"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isCheckList ? 'Checklist' : 'Content'}
                </label>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isCheckList}
                      onChange={() => setIsCheckList(!isCheckList)}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${
                      isCheckList ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`h-4 w-4 rounded-full bg-white transform transition-transform ${
                        isCheckList ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Checklist
                    </span>
                  </label>
                </div>
              </div>
              
              {isCheckList ? (
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
                        onClick={() => toggleChecked(item.id, !item.checked)}
                      >
                        {item.checked ? (
                          <CheckSquare size={18} className="text-primary-600 dark:text-primary-400" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      <span className={`flex-grow ${item.checked ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        {item.text}
                      </span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      className="input mr-2"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Add a new item"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addChecklistItem();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addChecklistItem}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <textarea
                  id="content"
                  className="input min-h-[150px]"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Note Content"
                ></textarea>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-2">
                {noteColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color.id 
                        ? 'border-primary-600 dark:border-primary-400' 
                        : 'border-transparent'
                    } ${color.bg}`}
                    onClick={() => setSelectedColor(color.id)}
                    aria-label={`Select ${color.id} color`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setEditingNote(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveNote}
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  if (!user) return null;
  
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={createNewNote}
        >
          New Note
        </Button>
      </div>
      
      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <Loader size="large" />
        </div>
      ) : notes.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Notes Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first note to get started. You can add text notes or create checklists.
          </p>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={createNewNote}
          >
            Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={`note-card ${getNoteColorClasses(note.color)} hover:translate-y-[-2px]`}
              onClick={() => startEditing(note)}
            >
              <div className="p-4">
                {note.title && (
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {note.title}
                  </h3>
                )}
                
                {note.isCheckList && note.items && note.items.length > 0 ? (
                  <div className="space-y-1 mb-2 max-h-[200px] overflow-y-auto">
                    {note.items.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex items-start">
                        <span className="flex-shrink-0 mt-0.5 mr-2">
                          {item.checked ? (
                            <CheckSquare size={16} className="text-primary-600 dark:text-primary-400" />
                          ) : (
                            <Square size={16} />
                          )}
                        </span>
                        <span className={`text-sm ${item.checked ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                    {note.items.length > 5 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        +{note.items.length - 5} more items
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                    {note.content || <span className="text-gray-400 dark:text-gray-500 italic">No content</span>}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>{format(new Date(note.updatedAt), 'MMM d, yyyy')}</div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(note);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      aria-label="Edit note"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNoteHandler(note);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"
                      aria-label="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {renderNoteEditor()}
    </div>
  );
};

export default Notes;