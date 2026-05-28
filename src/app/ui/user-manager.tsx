"use client";

import { FormEvent, useMemo, useState } from "react";

type ManagedUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count: {
    learningHistory: number;
    pushSubscriptions: number;
  };
};

type Props = {
  currentUserId: string;
  initialUsers: ManagedUser[];
};

type EditableUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
};

const emptyDraft = {
  email: "",
  name: "",
  password: "",
  isAdmin: false,
};

export function UserManager({ currentUserId, initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditableUser | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return users;
    }

    return users.filter((user) =>
      [user.email, user.name ?? "", user.isAdmin ? "admin" : "member"]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, users]);

  async function parseResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "操作失敗，請稍後再試。");
    }

    return data;
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await parseResponse(response);
      setUsers((current) => [data.user, ...current]);
      setDraft(emptyDraft);
      setMessage("已新增使用者。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "新增失敗。");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(user: ManagedUser) {
    setEditingId(user.id);
    setEditDraft({
      id: user.id,
      email: user.email,
      name: user.name ?? "",
      password: "",
      isAdmin: user.isAdmin,
    });
    setMessage("");
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editDraft) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      const data = await parseResponse(response);
      setUsers((current) =>
        current.map((user) => (user.id === data.user.id ? data.user : user)),
      );
      setEditingId(null);
      setEditDraft(null);
      setMessage(data.currentUserChanged ? "已更新你的帳號資料。" : "已更新使用者。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新失敗。");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`確定要刪除 ${user.email}？相關學習紀錄與推播訂閱也會移除。`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      await parseResponse(response);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage("已刪除使用者。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "刪除失敗。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="user-admin-layout">
      <form className="user-form tool-panel" onSubmit={createUser}>
        <div>
          <p className="eyebrow">Create</p>
          <h2>新增使用者</h2>
        </div>

        <label>
          姓名
          <input
            name="name"
            autoComplete="name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
          />
        </label>

        <label>
          密碼
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={draft.password}
            onChange={(event) => setDraft({ ...draft, password: event.target.value })}
          />
        </label>

        <label className="checkbox-row">
          <input
            name="isAdmin"
            type="checkbox"
            checked={draft.isAdmin}
            onChange={(event) => setDraft({ ...draft, isAdmin: event.target.checked })}
          />
          管理員
        </label>

        <button type="submit" className="primary-button" disabled={loading}>
          新增
        </button>
      </form>

      <section className="tool-panel user-list-panel">
        <div className="user-list-head">
          <div>
            <p className="eyebrow">Users</p>
            <h2>帳號清單</h2>
          </div>
          <label>
            搜尋
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="姓名、Email、角色"
            />
          </label>
        </div>

        {message ? <p className="form-message">{message}</p> : null}

        <div className="user-table" role="table" aria-label="使用者清單">
          <div className="user-table-row user-table-head" role="row">
            <span role="columnheader">使用者</span>
            <span role="columnheader">角色</span>
            <span role="columnheader">紀錄</span>
            <span role="columnheader">建立時間</span>
            <span role="columnheader">操作</span>
          </div>

          {filteredUsers.map((user) =>
            editingId === user.id && editDraft ? (
              <form
                className="user-table-row user-edit-row"
                key={user.id}
                onSubmit={saveUser}
                role="row"
              >
                <span role="cell">
                  <input
                    value={editDraft.name}
                    aria-label="姓名"
                    placeholder="姓名"
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, name: event.target.value })
                    }
                  />
                  <input
                    value={editDraft.email}
                    aria-label="Email"
                    type="email"
                    required
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, email: event.target.value })
                    }
                  />
                  <input
                    value={editDraft.password}
                    aria-label="新密碼"
                    type="password"
                    minLength={8}
                    placeholder="新密碼，可留空"
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, password: event.target.value })
                    }
                  />
                </span>
                <span role="cell">
                  <label className="checkbox-row compact">
                    <input
                      type="checkbox"
                      checked={editDraft.isAdmin}
                      onChange={(event) =>
                        setEditDraft({ ...editDraft, isAdmin: event.target.checked })
                      }
                    />
                    管理員
                  </label>
                </span>
                <span role="cell">{user._count.learningHistory} 筆</span>
                <span role="cell">{formatDate(user.createdAt)}</span>
                <span className="row-actions" role="cell">
                  <button type="submit" className="primary-button" disabled={loading}>
                    儲存
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setEditingId(null);
                      setEditDraft(null);
                    }}
                  >
                    取消
                  </button>
                </span>
              </form>
            ) : (
              <div className="user-table-row" key={user.id} role="row">
                <span role="cell">
                  <strong>{user.name || "未命名"}</strong>
                  <small>{user.email}</small>
                </span>
                <span role="cell">
                  <mark>{user.isAdmin ? "管理員" : "會員"}</mark>
                </span>
                <span role="cell">
                  {user._count.learningHistory} 學習 / {user._count.pushSubscriptions} 推播
                </span>
                <span role="cell">{formatDate(user.createdAt)}</span>
                <span className="row-actions" role="cell">
                  <button type="button" className="ghost-button" onClick={() => startEdit(user)}>
                    編輯
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={loading || user.id === currentUserId}
                    onClick={() => deleteUser(user)}
                  >
                    刪除
                  </button>
                </span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
