// d:\edu_hub\frontend\js\home.js
import { SocketManager } from './socket.js';
import { DataService } from './dataService.js';

class HomePage {
    constructor() {
        this.socket = SocketManager.initializeSocket();
        this.dataService = new DataService();
        this.initEventListeners();
        this.loadRecentActivities();
    }

    initEventListeners() {
        // Add any page-specific event listeners
    }

    async loadRecentActivities() {
        try {
            const activities = await this.dataService.getRecentActivities();
            this.renderActivities(activities);
        } catch (error) {
            console.error('Failed to load recent activities:', error);
        }
    }

    renderActivities(activities) {
        const container = document.getElementById('recentActivities');
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <img src="${activity.userAvatar}" alt="${activity.username}">
                <div class="activity-details">
                    <p>${activity.username} ${activity.action}</p>
                    <small>${activity.timestamp}</small>
                </div>
            </div>
        `).join('');
    }
}

// Initialize the home page
document.addEventListener('DOMContentLoaded', () => new HomePage());