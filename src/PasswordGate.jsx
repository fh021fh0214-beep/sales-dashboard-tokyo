import { useState, useEffect } from 'react'

// パスワードの SHA-256 ハッシュ（平文は保存しない）
// 変更したい場合: node -e "console.log(require('crypto').createHash('sha256').update('新パスワード').digest('hex'))"
// で生成したハッシュをここに貼り替える
const PASSWORD_HASH = '1449215104a490637d6c66cda249231b07e610ef790ac24ef6bb4491668336f9'

// localStorage に保存するキー（値は認証済みフラグ＝ハッシュ）
const STORAGE_KEY = 'dash_auth'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  // 初回マウント時：このデバイスが認証済みか確認
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH) {
      setAuthed(true)
    }
    setChecked(true)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(false)
    const hash = await sha256(input)
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEY, PASSWORD_HASH) // このデバイスを記憶
      setAuthed(true)
    } else {
      setError(true)
      setInput('')
    }
    setBusy(false)
  }

  // localStorage 確認が終わるまで何も描画しない（チラつき防止）
  if (!checked) return null

  if (authed) return children

  // ── ログイン画面 ──
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', fontFamily: 'system-ui, sans-serif', padding: 20,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 16,
        padding: '32px 28px', width: '100%', maxWidth: 360, boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🔐</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>営業ダッシュボード</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>パスワードを入力してください</div>
        </div>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          autoFocus
          placeholder="パスワード"
          style={{
            width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14,
            background: '#0f172a', color: '#f1f5f9',
            border: `1px solid ${error ? '#ef4444' : '#334155'}`, borderRadius: 9, outline: 'none',
          }}
        />
        {error && (
          <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
            パスワードが違います
          </div>
        )}
        <button type="submit" disabled={busy || !input} style={{
          width: '100%', marginTop: 16, padding: '11px 0', fontSize: 14, fontWeight: 700,
          background: busy || !input ? '#475569' : '#3b82f6', color: '#fff',
          border: 'none', borderRadius: 9, cursor: busy || !input ? 'default' : 'pointer',
        }}>
          {busy ? '確認中…' : 'ログイン'}
        </button>
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
          ※ 一度ログインすると、このデバイスでは<br />次回以降パスワード入力は不要です
        </div>
      </form>
    </div>
  )
}
