// Export and Share utilities for itineraries

export const exportToPDF = (itinerary, tripDetails) => {
  // Create a simple HTML content for PDF generation
  const htmlContent = generateItineraryHTML(itinerary, tripDetails);
  
  // Create a new window with the content
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

export const shareItinerary = (itinerary, tripDetails) => {
  const shareText = generateShareText(itinerary, tripDetails);
  
  if (navigator.share) {
    // Use native sharing if available
    navigator.share({
      title: `My ${tripDetails.destination} Itinerary`,
      text: shareText,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback to clipboard
    copyToClipboard(shareText);
    alert('Itinerary copied to clipboard!');
  }
};

export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

const generateItineraryHTML = (itinerary, tripDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${tripDetails.destination} Itinerary</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .day { margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .day-header { background: #f3f4f6; padding: 15px; font-weight: bold; }
        .activity { padding: 15px; border-bottom: 1px solid #e5e7eb; }
        .activity:last-child { border-bottom: none; }
        .activity-name { font-weight: bold; margin-bottom: 5px; }
        .activity-description { color: #6b7280; margin-bottom: 5px; }
        .activity-cost { color: #059669; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${tripDetails.destination} Itinerary</h1>
        <p>${tripDetails.duration} days • ${tripDetails.budget} • ${tripDetails.interests.join(', ')}</p>
      </div>
      
      ${itinerary.map(day => `
        <div class="day">
          <div class="day-header">Day ${day.day}: ${day.title}</div>
          ${day.activities.map(activity => `
            <div class="activity">
              <div class="activity-name">${activity.name}</div>
              <div class="activity-description">${activity.description}</div>
              ${activity.estimated_cost ? `<div class="activity-cost">${activity.estimated_cost}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;
};

const generateShareText = (itinerary, tripDetails) => {
  let text = `🗺️ My ${tripDetails.destination} Itinerary (${tripDetails.duration} days)\n\n`;
  
  itinerary.forEach(day => {
    text += `📅 Day ${day.day}: ${day.title}\n`;
    day.activities.forEach(activity => {
      text += `• ${activity.name}`;
      if (activity.estimated_cost) {
        text += ` (${activity.estimated_cost})`;
      }
      text += '\n';
    });
    text += '\n';
  });
  
  text += `\nGenerated with GenItinerary - AI-powered travel planning!`;
  
  return text;
};
