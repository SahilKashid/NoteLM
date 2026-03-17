import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { ApiKeyConfig } from '../types';

interface ApiKeyManagerProps {
  selectedKeyId: string | null;
  onSelectKey: (id: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ selectedKeyId, onSelectKey }) => {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('notelm_api_keys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setKeys(parsedKeys);
        
        // If there's only one key and none selected, select it
        if (parsedKeys.length > 0 && !selectedKeyId) {
          onSelectKey(parsedKeys[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved API keys", e);
      }
    }
  }, []);

  // Save keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notelm_api_keys', JSON.stringify(keys));
  }, [keys]);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newKey.trim()) return;

    const newConfig: ApiKeyConfig = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      key: newKey.trim()
    };

    const updatedKeys = [...keys, newConfig];
    setKeys(updatedKeys);
    onSelectKey(newConfig.id);
    setNewName('');
    setNewKey('');
    setShowAddForm(false);
  };

  const handleDeleteKey = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedKeys = keys.filter(k => k.id !== id);
    setKeys(updatedKeys);
    if (selectedKeyId === id) {
      onSelectKey(updatedKeys.length > 0 ? updatedKeys[0].id : '');
    }
  };

  const selectedKey = selectedKeyId === 'platform-default' 
    ? { id: 'platform-default', name: 'Platform Default', key: 'Managed by AI Studio' }
    : keys.find(k => k.id === selectedKeyId);

  return (
    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden mb-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/20">
            <Key className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-medium text-white">Gemini API Configuration</h4>
            <p className="text-xs text-neutral-500">
              {selectedKey ? `Using: ${selectedKey.name}` : 'No API key selected'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-2">Options</p>
            
            {/* Platform Default Option */}
            <div 
              onClick={() => onSelectKey('platform-default')}
              className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                selectedKeyId === 'platform-default' 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-black/20 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedKeyId === 'platform-default' ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">Platform Default</p>
                  <p className="text-[10px] text-neutral-500">
                    Use the API key configured in AI Studio settings
                  </p>
                </div>
              </div>
            </div>

            {keys.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-2">Saved Keys</p>
                {keys.map((k) => (
                  <div 
                    key={k.id}
                    onClick={() => onSelectKey(k.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all mb-2 last:mb-0 ${
                      selectedKeyId === k.id 
                        ? 'bg-blue-500/10 border-blue-500/30' 
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedKeyId === k.id ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{k.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {k.key.substring(0, 4)}••••••••{k.key.substring(k.key.length - 4)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteKey(k.id, e)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showAddForm ? (
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-xs text-neutral-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add New API Key
            </button>
          ) : (
            <form onSubmit={handleAddKey} className="space-y-3 p-4 bg-black/40 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1.5">Key Name</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Personal Key"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1.5">API Key</label>
                <input 
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Save Key
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-neutral-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-200/70 leading-relaxed">
              Your API keys are stored locally in your browser. They are never sent to our servers. 
              Get your key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">Google AI Studio</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
