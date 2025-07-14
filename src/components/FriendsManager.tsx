'use client'

import { useState, useEffect } from 'react'
import { 
  searchUsers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  getFriends, 
  getFriendRequests,
  removeFriend
} from '@/lib/social.action'
import { Friend, FriendRequest } from '@/types/social'
import { UserPlus, Search, Users, UserCheck, UserX, UserMinus } from 'lucide-react'

export default function FriendsManager() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends')

  useEffect(() => {
    loadFriendsData()
  }, [])

  const loadFriendsData = async () => {
    setLoading(true)
    try {
      const [friendsResult, requestsResult] = await Promise.all([
        getFriends(),
        getFriendRequests()
      ])

      if (friendsResult.success) {
        setFriends(friendsResult.data || [])
      }

      if (requestsResult.success) {
        setFriendRequests(requestsResult.data || [])
      }
    } catch (error) {
      console.error('Error loading friends data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setSearchLoading(true)
    try {
      const result = await searchUsers(searchTerm)
      if (result.success) {
        setSearchResults(result.data || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      const result = await sendFriendRequest(friendId)
      if (result.success) {
        // Remove from search results
        setSearchResults(prev => prev.filter(user => user.id !== friendId))
        alert('Friend request sent successfully!')
      } else {
        alert(result.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      alert('Failed to send friend request')
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await acceptFriendRequest(requestId)
      if (result.success) {
        await loadFriendsData()
        alert('Friend request accepted!')
      } else {
        alert(result.error || 'Failed to accept friend request')
      }
    } catch (error) {
      console.error('Error accepting friend request:', error)
      alert('Failed to accept friend request')
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const result = await declineFriendRequest(requestId)
      if (result.success) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId))
        alert('Friend request declined')
      } else {
        alert(result.error || 'Failed to decline friend request')
      }
    } catch (error) {
      console.error('Error declining friend request:', error)
      alert('Failed to decline friend request')
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    try {
      const result = await removeFriend(friendId)
      if (result.success) {
        setFriends(prev => prev.filter(friend => friend.friendId !== friendId))
        alert('Friend removed successfully')
      } else {
        alert(result.error || 'Failed to remove friend')
      }
    } catch (error) {
      console.error('Error removing friend:', error)
      alert('Failed to remove friend')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 h-6 w-6 text-blue-600" />
              Friends & Social
            </h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('friends')}
                className={`py-4 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'friends'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Requests ({friendRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Find Friends
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'friends' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Your Friends</h2>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No friends yet. Start by searching for people to connect with!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {friend.friendAvatar ? (
                              <img src={friend.friendAvatar} alt={friend.friendName} className="w-10 h-10 rounded-full" />
                            ) : (
                              friend.friendName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{friend.friendName}</h3>
                            <p className="text-sm text-gray-500">{friend.friendEmail}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.friendId)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
                {friendRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No pending friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friendRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {request.fromUserAvatar ? (
                              <img src={request.fromUserAvatar} alt={request.fromUserName} className="w-10 h-10 rounded-full" />
                            ) : (
                              request.fromUserName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{request.fromUserName}</h3>
                            <p className="text-sm text-gray-500">{request.fromUserEmail}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request.id)}
                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Find Friends</h2>
                <div className="mb-6">
                  <div className="flex">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {searchLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    {searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{user.name || user.email}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(user.id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
