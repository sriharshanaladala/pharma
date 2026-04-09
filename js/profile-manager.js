let navbar = document.querySelector('.header .flex .navbar');
let profile = document.querySelector('.header .flex .profile');

document.querySelector('#menu-btn').onclick = () =>{
   navbar.classList.toggle('active');
   profile.classList.remove('active');
}

document.querySelector('#user-btn').onclick = () => {
   profile.classList.toggle('active');
   navbar.classList.remove('active');
}

window.onscroll = () =>{
   profile.classList.remove('active');
   navbar.classList.remove('active');
}

function loader(){
   const loaderElement = document.querySelector('.loader');
   if (loaderElement) loaderElement.style.display = 'none';
}

function fadeOut(){
   setTimeout(loader, 2000);
}

function updateUserStatus() {
   console.log('🔍 Checking user status...', new Date().toLocaleTimeString());
   const profileSection = document.querySelector('.header .flex .profile');
   if (!profileSection) {
      console.log('❌ Profile section not found');
      return;
   }

   let userData = localStorage.getItem('loggedInUser') || 
                   sessionStorage.getItem('loggedInUser') || 
                   localStorage.getItem('currentUser') || 
                   sessionStorage.getItem('currentUser');

   console.log('Storage check:', {loggedInUserLocal: !!localStorage.getItem('loggedInUser'), currentUserSession: !!sessionStorage.getItem('currentUser')});

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

         const logoutBtn = document.getElementById('logout-btn');
         if (logoutBtn) logoutBtn.onclick = (e) => {
            e.preventDefault();
            console.log('🚪 Logout clicked');
            logoutUser();
         };
         console.log('✅ Profile updated');
      } catch (error) {
         console.error('❌ Parse error:', error);
         setupDefaultProfile();
      }
   } else {
      console.log('❌ No user data');
      setupDefaultProfile();
   }
}

function setupDefaultProfile() {
   const profileSection = document.querySelector('.header .flex .profile');
   if (profileSection) {
      profileSection.classList.remove('logged-in');
      profileSection.innerHTML = `
         <div class="flex">
            <a href="register.html" class="btn">Signup</a>
            <a href="login.html" class="delete-btn">Login</a>
         </div>
      `;
   }
}

function logoutUser() {
   console.log('🚪 Logging out...');
   ['loggedInUser', 'userToken', 'currentUser'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
   });
   sessionStorage.removeItem('loginTime');
   const profile = document.querySelector('.header .flex .profile');
   if (profile) profile.classList.remove('active');
   updateUserStatus();
}

// Init
window.addEventListener('load', () => {
   updateUserStatus();
   fadeOut();
});

window.addEventListener('storage', (e) => {
   if (['loggedInUser', 'currentUser'].includes(e.key)) updateUserStatus();
});

// Multiple checks
[100, 500, 1000, 2000].forEach(delay => setTimeout(updateUserStatus, delay));
