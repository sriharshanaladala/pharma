let navbar = document.querySelector('.header .flex .navbar');
let profile = document.querySelector('.header .flex .profile');

document.querySelector('#menu-btn').onclick = () =>{
   navbar.classList.toggle('active');
   profile.classList.remove('active');
}

document.querySelector('#user-btn').onclick = () =>{
   profile.classList.toggle('active');
   navbar.classList.remove('active');
}

window.onscroll = () =>{
   profile.classList.remove('active');
   navbar.classList.remove('active');
}

function loader(){
   const loaderElement = document.querySelector('.loader');
   if (loaderElement) {
      loaderElement.style.display = 'none';
   }
}

function fadeOut(){
   setTimeout(() => {
      const loaderElement = document.querySelector('.loader');
      if (loaderElement) loaderElement.style.display = 'none';
   }, 2000);
}

// Check if user is logged in and update profile section
function updateUserStatus() {
   console.log('🔍 Checking user status...');
   const profileSection = document.querySelector('.header .flex .profile');

// Check loggedInUser first, then fallback to currentUser in both storages
   let userData = localStorage.getItem('loggedInUser') || 
                   sessionStorage.getItem('loggedInUser') || 
                   localStorage.getItem('currentUser') || 
                   sessionStorage.getItem('currentUser');

   if (userData) {
      try {
         const user = JSON.parse(userData);
         console.log('✅ User found:', user.name, user.email);
         profileSection.classList.add('logged-in');
         profileSection.innerHTML = `
            <div class="user-info">
               <p class="user-name">${user.name || 'User'}</p>
               <p class="user-email">${user.email}</p>
            </div>
            <button id="logout-btn" class="logout-btn">Sign Out</button>
         `;

         // Add event listener for logout button
         const logoutBtn = document.getElementById('logout-btn');
         if (logoutBtn) {
            logoutBtn.onclick = function(e) {
               e.preventDefault();
               console.log('🚪 Logout button clicked');
               logoutUser();
            };
         }
         console.log('✅ Profile updated with user data');
      } catch (error) {
         console.error('❌ Error parsing user data:', error);
         setupDefaultProfile();
      }
   } else {
      console.log('❌ No user data found');
      setupDefaultProfile();
   }
}

function setupDefaultProfile() {
   console.log('🔄 Setting up default profile');
   const profileSection = document.querySelector('.header .flex .profile');
   profileSection.classList.remove('logged-in');
   profileSection.innerHTML = `
      <div class="flex">
         <a href="register.html" class="btn">Signup</a>
         <a href="login.html" class="delete-btn">Login</a>
      </div>
   `;
   console.log('✅ Default profile set');
}

function logoutUser() {
   console.log('🚪 Logging out user...');
   // Clear all user data from both storages
   localStorage.removeItem('loggedInUser');
   localStorage.removeItem('userToken');
   localStorage.removeItem('currentUser');
   sessionStorage.removeItem('loggedInUser');
   sessionStorage.removeItem('currentUser');
   sessionStorage.removeItem('loginTime');

   // Close the profile menu if open
   const profile = document.querySelector('.header .flex .profile');
   if (profile) {
      profile.classList.remove('active');
   }

   updateUserStatus();
   console.log('✅ Logout complete - all user data cleared');
}

// Initialize user status on full load and listen for storage changes
window.addEventListener('load', () => {
   updateUserStatus();
   fadeOut();
});

// Listen for storage changes (cross-tab/page)
window.addEventListener('storage', (e) => {
   if (e.key === 'loggedInUser' || e.key === 'currentUser') {
      updateUserStatus();
   }
});

// Check user status multiple times during load (replaces interval)
const initChecks = [0, 500, 1000, 2000, 5000];
initChecks.forEach(delay => setTimeout(updateUserStatus, delay));


