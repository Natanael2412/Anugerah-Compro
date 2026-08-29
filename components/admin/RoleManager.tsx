"use client";

import { useState, useEffect, useRef } from "react";
import { getRoles, addRole, updateRole, deleteRole, type Role } from "@/lib/data/roles";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiChevronDown } from "react-icons/fi";

interface RoleManagerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleManager({ value, onChange }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRoles();
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setEditingId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadRoles() {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newValue.trim()) return;
    const added = await addRole(newValue.trim());
    if (added) {
      setRoles((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(added.name);
      setNewValue("");
      setIsAdding(false);
      setIsOpen(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editValue.trim()) return;
    const updated = await updateRole(id, editValue.trim());
    if (updated) {
      setRoles((prev) => prev.map((r) => r.id === id ? updated : r));
      if (value === roles.find(r => r.id === id)?.name) {
        onChange(updated.name);
      }
      setEditingId(null);
      setEditValue("");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the role "${name}"?`)) return;
    const success = await deleteRole(id);
    if (success) {
      setRoles((prev) => prev.filter((r) => r.id !== id));
      if (value === name) {
        onChange("");
      }
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Selector Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: "transparent",
          border: "1px solid rgba(192, 192, 192, 0.2)",
          borderRadius: "2px",
          color: value ? "var(--color-text)" : "var(--color-text-subtle)",
          fontFamily: "var(--font-inter)",
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: isOpen ? "rgba(192, 192, 192, 0.05)" : "transparent"
        }}
      >
        <span>{value || "Select or add role..."}</span>
        <FiChevronDown style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "4px",
          background: "var(--color-background)",
          border: "1px solid rgba(192,192,192,0.2)",
          borderRadius: "4px",
          zIndex: 50,
          maxHeight: "300px",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          {loading ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>
              Loading roles...
            </div>
          ) : (
            <>
              {/* List of Roles */}
              {roles.map((role) => (
                <div key={role.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid rgba(192,192,192,0.1)",
                  background: value === role.name ? "rgba(192,192,192,0.1)" : "transparent"
                }}>
                  {editingId === role.id ? (
                    <div style={{ display: "flex", gap: "0.5rem", flex: 1, alignItems: "center" }}>
                      <input 
                        type="text" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: "0.25rem 0.5rem",
                          background: "var(--color-surface)",
                          border: "1px solid rgba(192,192,192,0.3)",
                          color: "var(--color-text)",
                          fontSize: "0.85rem"
                        }}
                      />
                      <button type="button" onClick={() => handleUpdate(role.id)} style={{ color: "var(--color-silver)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                        <FiCheck />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div 
                        onClick={() => {
                          onChange(role.name);
                          setIsOpen(false);
                        }}
                        style={{ flex: 1, cursor: "pointer", fontSize: "0.85rem", color: "var(--color-text)" }}
                      >
                        {role.name}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="button" onClick={() => { setEditingId(role.id); setEditValue(role.name); setIsAdding(false); }} style={{ color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                          <FiEdit2 size={14} />
                        </button>
                        <button type="button" onClick={() => handleDelete(role.id, role.name)} style={{ color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add New Role Section */}
              {isAdding ? (
                <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem", background: "rgba(192,192,192,0.02)" }}>
                  <input 
                    type="text" 
                    value={newValue} 
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="New role name..."
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "0.25rem 0.5rem",
                      background: "var(--color-surface)",
                      border: "1px solid rgba(192,192,192,0.3)",
                      color: "var(--color-text)",
                      fontSize: "0.85rem"
                    }}
                  />
                  <button type="button" onClick={handleAdd} style={{ color: "var(--color-silver)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                    <FiCheck />
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); setNewValue(""); }} style={{ color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                    <FiX />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => { setIsAdding(true); setEditingId(null); }}
                  style={{ 
                    padding: "0.75rem", 
                    cursor: "pointer", 
                    fontSize: "0.85rem", 
                    color: "var(--color-silver)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(192,192,192,0.02)"
                  }}
                >
                  <FiPlus size={14} /> Add new role...
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
