import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { ErrorBanner, PageHeader, Panel, SuccessBanner } from '../components/ui'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [account, setAccount] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  })
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const updateAccount = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await api.patch('/user/update-account', account)
      await refreshUser()
      setMessage('Account details updated')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await api.patch('/user/change-password', passwords)
      setPasswords({ oldPassword: '', newPassword: '' })
      setMessage('Password changed')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (event) => {
    event.preventDefault()
    if (!avatar) return
    const formData = new FormData()
    formData.append('avatar', avatar)
    setSaving(true)
    try {
      await api.patch('/user/avatar', formData)
      await refreshUser()
      setAvatar(null)
      setMessage('Avatar updated')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update avatar')
    } finally {
      setSaving(false)
    }
  }

  const uploadCover = async (event) => {
    event.preventDefault()
    if (!coverImage) return
    const formData = new FormData()
    formData.append('coverImage', coverImage)
    setSaving(true)
    try {
      await api.patch('/user/cover-image', formData)
      await refreshUser()
      setCoverImage(null)
      setMessage('Cover image updated')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update cover image')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Update profile details, password, avatar, and cover image."
      />

      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold text-white">Profile details</h2>
          <form onSubmit={updateAccount} className="mt-4 space-y-3">
            <input
              value={account.fullName}
              onChange={(event) => setAccount({ ...account, fullName: event.target.value })}
              placeholder="Full name"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
            />
            <input
              value={account.email}
              onChange={(event) => setAccount({ ...account, email: event.target.value })}
              placeholder="Email"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
            />
            <button
              disabled={saving}
              type="submit"
              className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950 disabled:opacity-70"
            >
              Save account
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(event) => setPasswords({ ...passwords, oldPassword: event.target.value })}
              placeholder="Old password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
            />
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
              placeholder="New password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm outline-none"
            />
            <button
              disabled={saving}
              type="submit"
              className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950 disabled:opacity-70"
            >
              Update password
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Avatar</h2>
          <div className="mt-3 flex items-center gap-3">
            <img src={user?.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            <p className="text-sm text-slate-400">@{user?.username}</p>
          </div>
          <form onSubmit={uploadAvatar} className="mt-4 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-300"
            />
            <button
              disabled={saving || !avatar}
              type="submit"
              className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950 disabled:opacity-70"
            >
              Upload avatar
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Cover image</h2>
          {user?.coverImage ? (
            <img src={user.coverImage} alt="" className="mt-3 h-28 w-full rounded-2xl object-cover" />
          ) : (
            <p className="mt-3 text-sm text-slate-400">No cover image yet.</p>
          )}
          <form onSubmit={uploadCover} className="mt-4 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-300"
            />
            <button
              disabled={saving || !coverImage}
              type="submit"
              className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950 disabled:opacity-70"
            >
              Upload cover
            </button>
          </form>
        </Panel>
      </div>
    </div>
  )
}
