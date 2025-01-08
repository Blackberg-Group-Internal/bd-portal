'use client';

import React, { useState } from 'react';
import axios from 'axios';
import LikeIcon from '../../../../public/images/icons/thumbs-up.svg';
import DislikeIcon from '../../../../public/images/icons/thumbs-down.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import { useToast } from '@/app/context/ToastContext';

const FeedbackButtons = ({ rfpSummaryId, initialLikes, initialDislikes }) => {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(initialDislikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const { addToast } = useToast();

  const handleLike = async () => {
    if (hasLiked) return;

    try {
      const updatedLikes = likeCount + 1;
      const updatedDislikes = hasDisliked ? dislikeCount - 1 : dislikeCount;

      await axios.patch('/api/rfp-summary', {
        id: rfpSummaryId,
        likes: updatedLikes,
        dislikes: updatedDislikes,
      });

      setLikeCount(updatedLikes);
      if (hasDisliked) {
        setDislikeCount((prev) => prev - 1);
        setHasDisliked(false);
      }
      setHasLiked(true);
      addToast('Your like has been added.', 'success');
    } catch (error) {
      console.error('Error liking the summary:', error);
      addToast('Failed to add your like.', 'danger');
    }
  };

  const handleDislike = async () => {
    if (hasDisliked) return;

    try {
      const updatedDislikes = dislikeCount + 1;
      const updatedLikes = hasLiked ? likeCount - 1 : likeCount;

      await axios.patch('/api/rfp-summary', {
        id: rfpSummaryId,
        likes: updatedLikes,
        dislikes: updatedDislikes,
      });

      setDislikeCount(updatedDislikes);
      if (hasLiked) {
        setLikeCount((prev) => prev - 1);
        setHasLiked(false);
      }
      setHasDisliked(true);
      addToast('Your dislike has been added.', 'success');
    } catch (error) {
      console.error('Error disliking the summary:', error);
      addToast('Failed to add your dislike.', 'danger');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        addToast('URL copied to clipboard.', 'success');
      })
      .catch((error) => {
        console.error('Error copying URL:', error);
        addToast('Failed to copy URL.', 'danger');
      });
  };

  return (
    <div className="feedback-buttons d-flex gap-2 justify-space-between">
      <button className="btn btn--white text-dark pointer w-25 text-nowrap" onClick={handleLike} disabled={hasLiked}>
        <LikeIcon className="" />
        {likeCount > 0 && <span className="ms-2">{likeCount}</span>}
      </button>
      <button className="btn btn--white text-dark pointer w-25 text-nowrap" onClick={handleDislike} disabled={hasDisliked}>
        <DislikeIcon className="" />
        {dislikeCount > 0 && <span className="ms-2">{dislikeCount}</span>}
      </button>
      <button className="btn btn--white text-dark pointer w-50 text-nowrap" onClick={handleShare}>
        <ShareIcon className="me-2" />
        Share
      </button>
    </div>
  );
};

export default FeedbackButtons;