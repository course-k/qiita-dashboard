import type { Profile } from '../types'

interface Props {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <img
        src={profile.image_url}
        alt={profile.name}
        className="w-14 h-14 rounded-full"
      />
      <div>
        <p className="font-semibold text-gray-900">{profile.name}</p>
        <p className="text-sm text-gray-500">@{profile.id}</p>
        {profile.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{profile.description}</p>
        )}
      </div>
      <div className="ml-auto flex gap-6 text-center">
        <div>
          <p className="text-lg font-bold text-gray-900">{profile.items_count}</p>
          <p className="text-xs text-gray-500">記事</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{profile.followers_count}</p>
          <p className="text-xs text-gray-500">フォロワー</p>
        </div>
      </div>
    </div>
  )
}
