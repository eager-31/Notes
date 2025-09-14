'use client'; // This is required for React hooks like useState

import { useState, useEffect, FormEvent } from 'react';

// Define the shape of a Note object for TypeScript
interface Note {
  id: string;
  title: string;
  content: string;
}

export default function HomePage() {
  // State variables to manage the UI and data
  const [token, setToken] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [error, setError] = useState('');

  // This effect runs once when the component loads to check for a token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // This effect runs whenever the token changes
  useEffect(() => {
    if (token) {
      fetchNotes();
    } else {
      // Clear notes if there's no token
      setNotes([]);
    }
  }, [token]);

  // --- API Call Functions ---

  const fetchNotes = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch notes.');
      }
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }
      const { token: newToken } = await res.json();
      localStorage.setItem('authToken', newToken); // Save token to local storage
      setToken(newToken);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCreateNote = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create note');
      }

      // Reset form and refresh notes
      setNoteTitle('');
      setNoteContent('');
      fetchNotes();
    } catch (err) {
      setError((err as Error).message);
    }
  };

const handleDeleteNote = async (id: string) => {
  if (!token) return;

  try {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // If the server responded with an error, handle it
      throw new Error('Failed to delete the note.');
    }

    fetchNotes(); // Refresh notes list only on success
  } catch (err) {
    // Assuming you have an 'error' state variable like in your other functions
    setError((err as Error).message);
  }
};

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  // --- Render Logic ---

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">SaaS Notes App</h1>
          {token && <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md">Logout</button>}
        </div>

        {!token ? (
          // LOGIN VIEW
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="admin@acme.test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-semibold">Login</button>
              {error && <p className="text-red-400 mt-4">{error}</p>}
            </form>
          </div>
        ) : (
          // NOTES VIEW
          <div>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-2xl mb-4">Create a New Note</h2>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <input
                  type="text"
                  placeholder="Note Title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"
                />
                <textarea
                  placeholder="Note Content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 h-24"
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold">Create Note</button>
                {error && (
                  <p className="text-yellow-400 mt-4">
                    {error}
                    {error.includes('limit reached') && <span className="ml-2 font-bold cursor-pointer underline">Upgrade to Pro!</span>}
                  </p>
                )}
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold border-b border-gray-700 pb-2">Your Notes</h2>
              {notes.length > 0 ? (
                notes.map(note => (
                  <div key={note.id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-400">{note.title}</h3>
                      <p className="text-gray-300 mt-1">{note.content}</p>
                    </div>
                    <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">DELETE</button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">You have no notes yet. Create one above!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}