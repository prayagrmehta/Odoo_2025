// Mock swap requests storage (in a real app, this would be an API)
let swapRequests = [
  {
    id: 1,
    fromUserId: 2,
    toUserId: 1,
    fromUser: {
      name: 'Michael',
      photo: null,
      rating: 4.2,
      skillsOffered: ['JavaScript', 'React'],
      skillsWanted: ['Design'],
    },
    toUser: {
      name: 'Marc Demo',
      photo: null,
      rating: 3.9,
      skillsOffered: ['Photoshop', 'Excel'],
      skillsWanted: ['Python'],
    },
    status: 'Pending',
    createdAt: new Date('2024-01-15'),
    message: 'I can help you with JavaScript and React in exchange for Design skills!'
  },
  {
    id: 2,
    fromUserId: 3,
    toUserId: 1,
    fromUser: {
      name: 'Joe Vills',
      photo: null,
      rating: 4.0,
      skillsOffered: ['Cooking'],
      skillsWanted: ['Photography'],
    },
    toUser: {
      name: 'Marc Demo',
      photo: null,
      rating: 3.9,
      skillsOffered: ['Photoshop', 'Excel'],
      skillsWanted: ['Python'],
    },
    status: 'Accepted',
    createdAt: new Date('2024-01-14'),
    message: 'Would love to learn photography from you!'
  }
];

export const swapService = {
  // Create a new swap request
  createSwapRequest: async (fromUserId, toUserId, message = '') => {
    // In a real app, this would be an API call
    const newRequest = {
      id: Date.now(),
      fromUserId,
      toUserId,
      fromUser: {
        name: 'Current User', // This would come from auth context
        photo: null,
        rating: 4.5,
        skillsOffered: ['React', 'JavaScript'],
        skillsWanted: ['Design'],
      },
      toUser: {
        name: 'Target User', // This would come from the user being requested
        photo: null,
        rating: 4.2,
        skillsOffered: ['Design'],
        skillsWanted: ['React'],
      },
      status: 'Pending',
      createdAt: new Date(),
      message
    };
    
    swapRequests.push(newRequest);
    return newRequest;
  },

  // Get swap requests for a user (both sent and received)
  getSwapRequests: async (userId) => {
    // In a real app, this would be an API call
    return swapRequests.filter(req => 
      req.fromUserId === userId || req.toUserId === userId
    );
  },

  // Accept a swap request
  acceptSwapRequest: async (requestId) => {
    const request = swapRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'Accepted';
      return request;
    }
    throw new Error('Request not found');
  },

  // Reject a swap request
  rejectSwapRequest: async (requestId) => {
    const request = swapRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'Rejected';
      return request;
    }
    throw new Error('Request not found');
  },

  // Check if a swap request already exists between two users
  checkExistingRequest: (fromUserId, toUserId) => {
    return swapRequests.find(req => 
      req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'Pending'
    );
  }
}; 