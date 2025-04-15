export // Generate a deterministic pastel color based on tag name
  const getTagColor = (tagName: string) => {
    // Simple hash function for the tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // List of pastel color pairs (background and text)
    const colorPairs = [
      { bg: 'bg-blue-50', text: 'text-blue-700' },
      { bg: 'bg-green-50', text: 'text-green-700' },
      { bg: 'bg-purple-50', text: 'text-purple-700' },
      { bg: 'bg-pink-50', text: 'text-pink-700' },
      { bg: 'bg-yellow-50', text: 'text-yellow-700' },
      { bg: 'bg-indigo-50', text: 'text-indigo-700' },
      { bg: 'bg-red-50', text: 'text-red-700' },
      { bg: 'bg-orange-50', text: 'text-orange-700' },
      { bg: 'bg-teal-50', text: 'text-teal-700' },
      { bg: 'bg-cyan-50', text: 'text-cyan-700' }
    ];

    // Use the hash to select a color pair
    const colorIndex = Math.abs(hash) % colorPairs.length;
    return colorPairs[colorIndex];
  };