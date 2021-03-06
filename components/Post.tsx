import { ArrowDownIcon, ArrowUpIcon, ChatAltIcon, DotsHorizontalIcon, GiftIcon, ShareIcon } from '@heroicons/react/outline'
import React, { useEffect, useState } from 'react'
import Avatar from './Avatar'
import TimeAgo from 'react-timeago'
import { BookmarkIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { Jelly } from '@uiball/loaders'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from '@apollo/client'
import { GET_ALL_VOTES_BY_POST_ID } from '../graphql/queries'
import { ADD_VOTE } from '../graphql/mutations'
import { useRecoilState } from 'recoil'
import { postIdState } from "../atoms/postAtom"
import { Router, useRouter } from 'next/router'

type Props = {
    post?: Post
}

function Post({post}: Props) {

  const [vote, setVote] = useState<boolean>()
  const { data: session } = useSession()
  const [postId, setPostId] = useRecoilState(postIdState)

  // Fetch votes associated with the post id
  const {data, loading} = useQuery(GET_ALL_VOTES_BY_POST_ID, {
    variables: {
      post_id: post?.id,
    }
  })

  // Add a vote to the query
  const [addVote] = useMutation(ADD_VOTE, {
    refetchQueries: [GET_ALL_VOTES_BY_POST_ID, 'getVotesByPostId']
  })

  // Calculate the number of votes 
  const displayVotes = () => {
    const votes: Vote[] = data?.getVotesByPostId 
    const displayNumber = votes?.reduce(
      (total, vote) => (vote.upvote ? (total += 1) : (total -= 1)),
      0
    )

    if (votes?.length === 0) return 0

    if (displayNumber === 0) {
      return votes[0]?.upvote ? 1 : -1
    }
    return displayNumber;
  }

  // Update the vote everytime that the vote is changed
  useEffect(() => {
    const votes: Vote[] = data?.getVotesByPostId

    const vote = votes?.find(
      (vote) => vote.username === session?.user?.name
    )?.upvote

    setVote(vote)

  }, [data])

  const upVote = async (isUpvote: boolean) => {
    if(!session) {
      toast("! you'll need to sign in to Vote!")
      return
    }

    if (vote && isUpvote) return
    if (vote === false && !isUpvote) return
    
    await addVote({
      variables: {
        post_id: post?.id,
        username: session.user?.name,
        upvote: isUpvote,
      }
    })
  }
  const router = useRouter()

  // Goes to post page 
  const goToPost = () => {
    // Set post id in recoil atom
    setPostId(post as Post)
    router.push(`/post/${post?.id}`)
  }



  /*if(!post) return (
    <div className="flex w-full items-ceter justify-center p-10 text-xl">
      <Jelly size={50} color="#FF4501"/>
    </div>
  )*/

  return (
    <div>
    { post ?
      <div onClick={goToPost}>
        <div className="flex cursor-pointer rounded-md border border-gray-300 bg-white
        shadow-sm hover:border hover:border-gray-600">
            {/* Votes */}
            <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md 
            bg-gray-50 text-gray-400 p-4">
                <ArrowUpIcon 
                  onClick={() => upVote(true)} 
                  className={`voteBottons hover:text-blue-400 ${
                      vote && 'text-blue-400'}
                    `}
                />
                <p className="text-xs font-bold text-black">{displayVotes()}</p>
                <ArrowDownIcon 
                  onClick={() => upVote(false)} 
                  className={`voteBottons hover:text-red-400 ${
                    vote === false && 'text-red-400'
                  }`}
                />
            </div>

            <div className="p-3 pb-1">
              {/* Header */}
              <div className="flex items-center space-x-2">
                <Avatar seed={post.subreddit[0]?.topic}/>
                <p className="text-xs text-gray-400">
                  <Link href = {`/subreddit/${post.subreddit[0]?.topic}`}>
                    <span className="font-bold text-black hover:text-blue-400 hover:underline">
                      r/{post.subreddit[0]?.topic}
                    </span>
                  </Link>{''}
                  
                  .posted by u/
                  {post.username} <TimeAgo date={post.created_at}/>
                </p>
              </div>
              
                {/* Body */}
                <div className="py-4">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="mt-2 text-sm font-light">{post.body}</p>
                </div>

                {/* Image */}
                <img className="w-full" src={post.image} alt=""/>

                {/* Footer */}
                <div className="flex space-x-4 text-gray-400">
                  <div className="postButtons">
                    <ChatAltIcon className="h-6 w-6"/>
                    <p className="">{post.comments.length} Comments</p>
                  </div>

                  <div className="postButtons">
                    <GiftIcon className="h-6 w-6"/>
                    <p className="hidden sm:inline">Comments</p>
                  </div>

                  <div className="postButtons">
                    <ShareIcon className="h-6 w-6"/>
                    <p className="hidden sm:inline">Award</p>
                  </div>

                  <div className="postButtons">
                    <BookmarkIcon className="h-6 w-6"/>
                    <p className="hidden sm:inline">Save</p>
                  </div>

                  <div className="postButtons">
                    <DotsHorizontalIcon className="h-6 w-6"/>
                    <p className="hidden sm:inline"></p>
                  </div>

                </div>

              
            </div>
        </div>
    </div>:
        <div className="flex w-full items-ceter justify-center p-10 text-xl">
          <Jelly size={50} color="#FF4501"/>
        </div>}
    </div>

  )
}

export default Post

