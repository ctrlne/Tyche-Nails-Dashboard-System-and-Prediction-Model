// This script contains all the logic for the Tyche Nails Dashboard.
// It manages the state, renders all pages and components, and handles user interactions.
document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA & STATE ---
    let data = {
      user: { name: 'Tyche Team', email: 'hello@tychenails.com' },
      stats: { totalRevenue: 0, totalIncome: 0, revenueChange: 2.41, incomeChange: 3.58 },
      salesOverview: [
        { name: 'Jan', income: 16000, expense: 12000 }, { name: 'Feb', income: 18000, expense: 14000 },
        { name: 'Mar', income: 14000, expense: 11000 }, { name: 'Apr', income: 17000, expense: 13000 },
        { name: 'May', income: 21000, expense: 16000 }, { name: 'Jun', income: 18000, expense: 15000 },
        { name: 'Jul', income: 22000, expense: 17000 }, { name: 'Aug', income: 19000, expense: 15000 },
        { name: 'Sep', income: 23000, expense: 18000 }, { name: 'Oct', income: 25000, expense: 20000 },
        { name: 'Nov', income: 24000, expense: 19000 }, { name: 'Dec', income: 28000, expense: 22000 },
      ],
      staff: [
        { id: 1, name: 'Bianca Ramirez', role: 'Nail Technician', schedule: 'Mon-Fri, 9am-5pm' },
        { id: 2, name: 'Chloe Santos', role: 'Lash & Brow Artist', schedule: 'Tue-Sat, 10am-6pm' },
        { id: 3, name: 'Angela Reyes', role: 'Nail Artist', schedule: 'Mon-Wed, 11am-7pm' },
        { id: 4, name: 'Carl Mendoza', role: 'Junior Technician', schedule: 'Thu-Sun, 12pm-8pm'}
      ],
      bookings: [
        { id: 1, date: '2025-07-28', startTime: '09:00', endTime: '10:30', client: 'Claire Mendoza', serviceId: 1, staffId: 1, status: 'Confirmed' },
        { id: 2, date: '2025-07-24', startTime: '10:00', endTime: '11:00', client: 'Jane Doe', serviceId: 2, staffId: 2, status: 'Confirmed' },
        { id: 3, date: '2025-07-23', startTime: '12:00', endTime: '13:00', client: 'Alex Ray', serviceId: 3, staffId: 2, status: 'Confirmed' },
        { id: 4, date: '2025-04-15', startTime: '11:00', endTime: '12:00', client: 'Missed Client', serviceId: 2, staffId: 1, status: 'Pending' },
        { id: 5, date: '2025-08-02', startTime: '14:00', endTime: '15:00', client: 'Sarah Kim', serviceId: 2, staffId: 3, status: 'Pending' },
        { id: 6, date: '2025-07-23', startTime: '15:00', endTime: '16:00', client: 'TARA', serviceId: 1, staffId: 1, status: 'Confirmed' },
        { id: 7, date: '2025-07-29', startTime: '09:00', endTime: '10:00', client: 'Kim Ong', serviceId: 3, staffId: 4, status: 'Confirmed' },
        { id: 8, date: '2025-08-02', startTime: '11:00', endTime: '12:00', client: 'Future Client', serviceId: 2, staffId: 1, status: 'Pending' }
      ],
      messages: [],
      clients: [
        { id: 1, name: 'Claire Mendoza', level: 'VIP Client', totalVisits: 12, lastVisit: '2025-07-28', notes: "Prefers light pink colors." },
        { id: 2, name: 'Jane Doe', level: 'Regular', totalVisits: 5, lastVisit: '2025-07-24', notes: "" },
        { id: 3, name: 'Alex Ray', level: 'New', totalVisits: 2, lastVisit: '2025-07-23', notes: "" },
        { id: 4, name: 'TARA', level: 'New', totalVisits: 1, lastVisit: '2025-07-23', notes: "First time client." },
        { id: 5, name: 'Kim Ong', level: 'New', totalVisits: 1, lastVisit: '2025-07-29', notes: "" },
        { id: 6, name: 'Sarah Kim', level: 'New', totalVisits: 0, lastVisit: null, notes: "Has a pending booking." },
      ],
      services: [
        { id: 1, name: 'Soft Gel Extensions', duration: 165, price: 899, tags: ['Popular', 'Long Duration'], description: 'High-quality soft gel extensions for a durable and natural look.' },
        { id: 2, name: 'Classic Manicure', duration: 45, price: 299, tags: ['Quick'], description: 'A standard manicure including shaping, cuticle care, and polish.' },
        { id: 3, name: 'Nail Art Design', duration: 90, price: 599, tags: ['Premium'], description: 'Intricate and custom nail art designs by our talented artists.' },
      ],
    };

    let currentPage = 'Dashboard';
    let currentTheme = localStorage.getItem('tyche-theme') || 'light';
    document.documentElement.className = currentTheme;
    let calendarDate = new Date();
    let scheduleDate = new Date();
    let scheduleStaffFilter = 'all'; // State for the staff filter

    const getEl = (id) => document.getElementById(id);
    const queryEl = (sel) => document.querySelector(sel);
    const queryAll = (sel) => document.querySelectorAll(sel);

    const bookingModal = getEl('booking-modal');
    const bookingForm = getEl('booking-form');
    const clientModal = getEl('client-modal');
    const clientForm = getEl('client-form');
    const genericModal = getEl('message-modal');

    // --- AUTHENTICATION ---
    const loginContent = getEl('login-content');
    let teamPassword = localStorage.getItem('tyche-team-password');

    function showCreatePasswordForm() {
        loginContent.innerHTML = `
            <h2 style="color: var(--color-primary); margin-bottom: 8px;">Create a Team Password</h2>
            <p style="color: #888; margin-bottom: 16px;">This password will be used by the whole team.</p>
            <form id="create-password-form" class="login-form">
                <p id="error-message"></p>
                <input type="password" id="new-password" placeholder="New Password" required minlength="6">
                <input type="password" id="confirm-password" placeholder="Confirm Password" required minlength="6">
                <button type="submit" class="button button-primary">Set Password & Login</button>
            </form>
        `;
        getEl('create-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = getEl('new-password').value;
            const confirmPass = getEl('confirm-password').value;
            if (newPass !== confirmPass) {
                getEl('error-message').textContent = 'Passwords do not match.'; return;
            }
            localStorage.setItem('tyche-team-password', newPass);
            teamPassword = newPass;
            login();
        });
    }

    function showLoginForm() {
        loginContent.innerHTML = `
            <h2 style="color: var(--color-primary); margin-bottom: 8px;">Welcome Back, Team!</h2>
            <p style="color: #888; margin-bottom: 16px;">Enter the team password to access the dashboard.</p>
            <form id="login-form" class="login-form">
                <p id="error-message"></p>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit" class="button button-primary">Login</button>
            </form>
            <button id="forgot-password">Forgot Password?</button>
        `;
        getEl('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = getEl('password').value;
            if (pass === teamPassword) { login(); } else { getEl('error-message').textContent = 'Incorrect password.'; }
        });
        getEl('forgot-password').addEventListener('click', () => {
             const email = prompt("Please enter the team's recovery email to reset the password:");
             if (email) { alert(`A password reset link has been sent to ${email}. (This is a simulation)`); }
        });
    }

    function login() {
        getEl('login-page').style.opacity = '0';
        setTimeout(() => {
            getEl('login-page').style.display = 'none';
            queryEl('.app-container').style.display = 'flex';
            
            updateTime();
            setInterval(updateTime, 60000);
            navigateTo('Dashboard');
        }, 500);
    }
    
    getEl('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        queryEl('.app-container').style.display = 'none';
        getEl('login-page').style.display = 'flex';
        setTimeout(() => { getEl('login-page').style.opacity = '1'; }, 10);
        showLoginForm();
    });

    // --- UTILITIES ---
    const nameToColor = (name) => {
        const colors = ['#DFA4C0', '#A9D8B6', '#A7CEE2', '#F3E5F5', '#FAD02E'];
        if (!name) return colors[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
        return colors[Math.abs(hash) % colors.length];
    };
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

    // --- MASTER RENDER FUNCTION ---
    function render() {
        calculateMonthlyStats();
        generateMessagesFromBookings();
        updateHeader();
        const pageRenderers = { 'Dashboard': renderDashboard, 'Schedule': renderSchedule, 'Inbox': renderInbox, 'Clients': renderClientsAndStaff, 'Services': renderServices, 'Reports': renderReports, 'Settings': renderSettings };
        if (pageRenderers[currentPage]) pageRenderers[currentPage]();
        lucide.createIcons();
    }
    
    // --- DYNAMIC DATA CALCULATION ---
    function calculateMonthlyStats() {
        const now = new Date();
        const bookingsThisMonth = data.bookings.filter(b => {
            const d = new Date(b.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && b.status === 'Confirmed';
        });
        const revenue = bookingsThisMonth.reduce((sum, booking) => sum + (data.services.find(s => s.id === booking.serviceId)?.price || 0), 0);
        data.stats.totalRevenue = revenue;
        data.stats.totalIncome = revenue * 0.8;
    }
    
    function generateMessagesFromBookings() {
        const now = new Date();
        data.messages = [];
        data.bookings.forEach(booking => {
            const bookingDayEnded = new Date(booking.date).setHours(23, 59, 59, 999) < now;
            if (bookingDayEnded && booking.status === 'Pending') {
                data.messages.push({ id: booking.id, type: 'Missed', client: booking.client, message: `Client missed an appointment from ${new Date(booking.date).toLocaleDateString()}.`, booking: booking });
            } else if (!bookingDayEnded && booking.status === 'Pending') {
                 data.messages.push({ id: booking.id, type: 'Pending', client: booking.client, message: `New booking for ${new Date(booking.date).toLocaleDateString()}. Please confirm.`, booking: booking });
            }
        });
    }

    // --- HEADER & NAVIGATION ---
    function updateHeader() {
        const avatar = getEl('profile-avatar');
        avatar.style.backgroundColor = nameToColor(data.user.name);
        avatar.textContent = getInitials(data.user.name);
        getEl('profile-name').textContent = data.user.name;
        getEl('profile-email').textContent = data.user.email;
        getEl('notification-dot').style.display = data.messages.length > 0 ? 'block' : 'none';
    }

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        getEl('header-time').textContent = `${dateString}, ${timeString}`;
    }

    getEl('theme-toggle').addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.className = currentTheme;
        localStorage.setItem('tyche-theme', currentTheme);
    });
    
    getEl('inbox-btn').addEventListener('click', () => navigateTo('Inbox'));

    const pageTitles = { 'Dashboard': { title: 'Good morning, Tyche Team!', subtitle: 'Here is your summary for today.' }, 'Schedule': { title: 'Schedule & Bookings', subtitle: 'Manage your monthly appointments.' }, 'Inbox': { title: 'Inbox', subtitle: 'Respond to client messages and pending bookings.' }, 'Clients': { title: 'Clients & Staff', subtitle: 'Manage your client and staff lists.' }, 'Services': { title: 'Services', subtitle: 'Manage your service offerings.' }, 'Reports': { title: 'Sales & Earnings Reports', subtitle: 'Filter and view detailed sales data.' }, 'Settings': { title: 'Settings', subtitle: 'Configure your dashboard.' }, };
    
    function navigateTo(pageId) {
        currentPage = pageId;
        queryAll('.page').forEach(p => p.classList.remove('active'));
        getEl(pageId).classList.add('active');
        queryAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${pageId}`));
        getEl('page-title').textContent = pageTitles[pageId].title;
        getEl('page-subtitle').textContent = pageTitles[pageId].subtitle;
        render();
    }
    
    queryAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.currentTarget.getAttribute('href').substring(1);
            if(pageId && pageId !== currentPage) navigateTo(pageId);
        });
    });

    // --- DASHBOARD PAGE ---
    function renderDashboard() {
        const page = getEl('Dashboard');
        const pendingCount = data.messages.filter(m => m.type === 'Pending').length;
        page.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-main">
                    <div class="stats-grid">
                        <div class="card stat-card">
                            <div class="stat-info"><h3>Revenue</h3><p>₱${data.stats.totalRevenue.toFixed(2)}</p><small>+${data.stats.revenueChange}% this month</small></div>
                            <div class="stat-icon" style="background-color: var(--color-success);"><i data-lucide="dollar-sign"></i></div>
                        </div>
                        <div class="card stat-card">
                            <div class="stat-info"><h3>Income</h3><p>₱${data.stats.totalIncome.toFixed(2)}</p><small>+${data.stats.incomeChange}% this month</small></div>
                            <div class="stat-icon" style="background-color: var(--color-info);"><i data-lucide="briefcase"></i></div>
                        </div>
                        <div class="card stat-card">
                            <div class="stat-info"><h3>Pending</h3><p>${pendingCount}</p><small>Bookings in inbox</small></div>
                            <div class="stat-icon" style="background-color: var(--color-accent);"><i data-lucide="mail-question"></i></div>
                        </div>
                    </div>
                    <div class="card" id="sales-overview-card"></div>
                    <div class="dashboard-subgrid">
                        <div class="card" id="service-breakdown-card"></div>
                        <div class="card" id="dashboard-staff-overview"></div>
                    </div>
                </div>
                <div class="dashboard-sidebar">
                    <div class="card" id="mini-calendar-container"></div>
                    <div class="card" id="upcoming-appointments-container"></div>
                </div>
            </div>`;
        renderSalesChart();
        renderPieChart();
        renderStaffOverview();
        renderMiniCalendar();
        renderUpcomingAppointments();
    }

    function renderSalesChart() {
        const container = getEl('sales-overview-card');
        const chartData = data.salesOverview;
        const maxVal = Math.max(...chartData.flatMap(d => [d.income, d.expense]));
        container.innerHTML = `
            <h3 style="font-weight: bold; color: var(--color-primary); margin-bottom: 16px;">Sales Overview (Yearly)</h3>
            <div class="bar-chart">
                ${chartData.map(d => `
                    <div class="bar-group">
                        <div class="bar" style="height: ${(d.income / maxVal) * 100}%; background-color: var(--color-secondary);"><span class="tooltip">Income: ₱${d.income.toLocaleString()}</span></div>
                        <div class="bar" style="height: ${(d.expense / maxVal) * 100}%; background-color: var(--color-accent);"><span class="tooltip">Expense: ₱${d.expense.toLocaleString()}</span></div>
                        <div class="bar-label">${d.name}</div>
                    </div>`).join('')}
            </div>`;
    }

    function renderPieChart() {
        const container = getEl('service-breakdown-card');
        container.innerHTML = `<h3 style="font-weight: bold; color: var(--color-primary); margin-bottom: 16px;">Service Breakdown</h3>
                               <div class="pie-chart-container"></div>`;
        const pieContainer = container.querySelector('.pie-chart-container');
        const bookingsByService = data.services.map(service => ({ name: service.name, count: data.bookings.filter(b => b.serviceId === service.id).length })).filter(s => s.count > 0);
        const totalBookings = bookingsByService.reduce((sum, s) => sum + s.count, 0);

        if (totalBookings === 0) {
            pieContainer.innerHTML = `<p>No booking data available.</p>`;
            return;
        }

        const radius = 70;
        let startAngle = 0;
        const colors = ['var(--color-secondary)', 'var(--color-primary)', 'var(--color-accent)', '#A9D8B6', '#A7CEE2'];

        const svgPaths = bookingsByService.map((service, index) => {
            const percent = service.count / totalBookings;
            const endAngle = startAngle + percent * 360;
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const x1 = radius + radius * Math.cos(Math.PI * startAngle / 180);
            const y1 = radius + radius * Math.sin(Math.PI * startAngle / 180);
            const x2 = radius + radius * Math.cos(Math.PI * endAngle / 180);
            const y2 = radius + radius * Math.sin(Math.PI * endAngle / 180);
            const pathData = `M ${radius},${radius} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
            startAngle = endAngle;
            return `<path class="pie-slice" d="${pathData}" style="fill:${colors[index % colors.length]};"><title>${service.name} (${(percent * 100).toFixed(1)}%)</title></path>`;
        }).join('');

        pieContainer.innerHTML = `
            <svg class="pie-chart-svg" viewBox="0 0 ${radius*2} ${radius*2}" width="140" height="140">${svgPaths}</svg>
            <div style="font-size: 0.9rem;">${bookingsByService.map((s, i) => `<p><span style="color: ${colors[i % colors.length]}">●</span> ${s.name}</p>`).join('')}</div>
        `;
    }

    function renderStaffOverview() {
        const container = getEl('dashboard-staff-overview');
        container.innerHTML = `<h3 style="font-weight: bold; color: var(--color-primary); margin-bottom: 16px;">Staff Workload</h3><div class="staff-list"></div>`;
        const staffListContainer = container.querySelector('.staff-list');
        data.staff.forEach(member => {
            const bookingsCount = data.bookings.filter(b => b.staffId === member.id).length;
            staffListContainer.innerHTML += `
                <div class="staff-member" style="margin-bottom: 12px;">
                    <div class="staff-info">
                        <div class="avatar" style="background-color: ${nameToColor(member.name)};">${getInitials(member.name)}</div>
                        <div><p style="font-weight: bold; color: var(--color-primary);">${member.name}</p><small style="color: #888;">${bookingsCount} booking(s)</small></div>
                    </div>
                </div>`;
        });
    }
    
    function renderMiniCalendar() {
        const container = getEl('mini-calendar-container');
        container.innerHTML = `
            <div class="calendar-header">
                <h3 id="calendar-month-year"></h3>
                <div class="calendar-controls">
                    <button id="prev-month" class="control-btn"><i data-lucide="chevron-left"></i></button>
                    <button id="next-month" class="control-btn"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
            <div class="calendar-grid" id="mini-calendar-names"></div>
            <div class="calendar-grid" id="mini-calendar-days"></div>`;
        
        const calendarDays = getEl('mini-calendar-days');
        getEl('calendar-month-year').textContent = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
        getEl('mini-calendar-names').innerHTML = ['S','M','T','W','T','F','S'].map(d => `<div class="calendar-day-name">${d}</div>`).join('');
        calendarDays.innerHTML = '';
        for (let i = 0; i < firstDayOfMonth; i++) { calendarDays.innerHTML += '<div></div>'; }
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = i;
            const today = new Date();
            if (i === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear()) {
                dayEl.classList.add('today');
            }
            if (data.bookings.some(b => new Date(b.date).setHours(0,0,0,0) === new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i).setHours(0,0,0,0))) {
                dayEl.classList.add('has-event');
            }
            calendarDays.appendChild(dayEl);
        }
        getEl('prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderMiniCalendar(); lucide.createIcons(); });
        getEl('next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderMiniCalendar(); lucide.createIcons(); });
    }
    
    function renderUpcomingAppointments() {
        const container = getEl('upcoming-appointments-container');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingBookings = data.bookings
            .filter(b => {
                const bookingDate = new Date(b.date + 'T00:00:00');
                return bookingDate >= today && b.status === 'Confirmed';
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateA - dateB;
            });
        
        let content;
        if (upcomingBookings.length === 0) {
            content = `<p style="color: #888; text-align: center; padding: 16px 0;">No upcoming appointments.</p>`;
        } else {
            content = upcomingBookings.slice(0, 5).map(appt => {
                const service = data.services.find(s => s.id === appt.serviceId);
                const displayDate = new Date(appt.date + 'T00:00:00');
                return `
                    <div class="appointment-item">
                        <p>${appt.client}</p>
                        <small>${displayDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})} at ${appt.startTime} - ${service.name}</small>
                    </div>`;
            }).join('');
        }
        container.innerHTML = `<h3>Upcoming Appointments</h3><div class="appointments-list">${content}</div>`;
    }

    // --- SCHEDULE PAGE ---
    function renderSchedule() {
        const page = getEl('Schedule');
        const month = scheduleDate.getMonth();
        const year = scheduleDate.getFullYear();
        const today = new Date();
        const currentDay = (today.getMonth() === month && today.getFullYear() === year) ? today.getDate() : 0;
        
        let yearOptions = '';
        for (let i = year - 5; i < year + 5; i++) yearOptions += `<option value="${i}" ${i === year ? 'selected' : ''}>${i}</option>`;
        
        const staffOptions = data.staff.map(s => `<option value="${s.id}" ${scheduleStaffFilter == s.id ? 'selected' : ''}>${s.name}</option>`).join('');

        page.innerHTML = `
            <div class="schedule-container">
                <div class="card">
                    <div class="schedule-header">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <button id="schedule-prev-month" class="control-btn"><i data-lucide="chevron-left"></i></button>
                            <h2>${scheduleDate.toLocaleString('default', { month: 'long' })}</h2>
                            <select id="schedule-year-select" style="width: auto; margin: 0; padding: 8px;">${yearOptions}</select>
                            <button id="schedule-next-month" class="control-btn"><i data-lucide="chevron-right"></i></button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <label for="staff-schedule-filter">View Schedule For:</label>
                            <select id="staff-schedule-filter" style="width: auto;"><option value="all" ${scheduleStaffFilter === 'all' ? 'selected' : ''}>All Staff</option>${staffOptions}</select>
                            <button id="add-booking-btn" class="button button-primary"><i data-lucide="plus"></i>Add Booking</button>
                        </div>
                    </div>
                    <div class="schedule-grid-header">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div>${d}</div>`).join('')}</div>
                    <div id="schedule-calendar-grid" class="schedule-grid-body"></div>
                </div>
            </div>`;

        const grid = getEl('schedule-calendar-grid');
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        grid.innerHTML = Array(firstDayOfMonth).fill('<div class="schedule-day other-month"></div>').join('');
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'schedule-day';
            if (i === currentDay) dayDiv.classList.add('today');
            
            let bookingsForDay = data.bookings.filter(b => new Date(b.date).setHours(0,0,0,0) === new Date(year, month, i).setHours(0,0,0,0));
            
            if (scheduleStaffFilter !== 'all') {
                bookingsForDay = bookingsForDay.filter(b => b.staffId === parseInt(scheduleStaffFilter));
            }
            
            const bookingsHTML = bookingsForDay.map(b => `<div class="schedule-booking-item" title="${b.client} - ${data.services.find(s=>s.id === b.serviceId)?.name}">${b.startTime} ${b.client}</div>`).join('');
            dayDiv.innerHTML = `<div class="schedule-day-number">${i}</div><div class="schedule-day-bookings">${bookingsHTML}</div>`;
            grid.appendChild(dayDiv);
        }
        
        getEl('schedule-prev-month').addEventListener('click', () => { scheduleDate.setMonth(month - 1); renderSchedule(); });
        getEl('schedule-next-month').addEventListener('click', () => { scheduleDate.setMonth(month + 1); renderSchedule(); });
        getEl('schedule-year-select').addEventListener('change', (e) => { scheduleDate.setFullYear(parseInt(e.target.value)); renderSchedule(); });
        getEl('add-booking-btn').addEventListener('click', () => openBookingModal());
        getEl('staff-schedule-filter').addEventListener('change', (e) => {
            scheduleStaffFilter = e.target.value;
            renderSchedule();
        });
        lucide.createIcons();
    }

    // --- INBOX PAGE ---
    function renderInbox() {
        const page = getEl('Inbox');
        page.innerHTML = `
            <div class="card">
                <h3>Inbox</h3>
                <p style="color: #888; margin-top: 4px;">Manage missed appointments and confirm new bookings.</p>
                <div id="inbox-list" style="margin-top: 24px; display: flex; flex-direction: column; gap: 16px;"></div>
            </div>`;
        const list = getEl('inbox-list');
        if (data.messages.length === 0) {
            list.innerHTML = `<p style="color: #888; text-align: center; padding: 32px 0;">Your inbox is empty!</p>`;
            return;
        }
        list.innerHTML = data.messages.map(msg => `
            <div class="card" style="border-left: 4px solid ${msg.type === 'Missed' ? '#f00' : 'var(--color-info)'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <p style="font-weight: bold; color: var(--color-primary);">${msg.type} Appointment: ${msg.client}</p>
                    <small style="color: #888;">${new Date(msg.booking.date).toLocaleDateString()}</small>
                </div>
                <p style="margin: 8px 0;">${msg.message}</p>
                <div class="modal-actions" style="margin: 0; padding: 0;">
                    ${msg.type === 'Pending' ? `<button class="button button-primary confirm-booking-btn" data-id="${msg.id}">Confirm</button>` : ''}
                    <button class="button button-secondary reschedule-booking-btn" data-id="${msg.id}">Reschedule</button>
                    <button class="button button-outline cancel-booking-btn" data-id="${msg.id}">Cancel</button>
                </div>
            </div>`).join('');

        queryAll('.confirm-booking-btn').forEach(btn => btn.addEventListener('click', e => handleBookingAction(e.currentTarget.dataset.id, 'confirm')));
        queryAll('.reschedule-booking-btn').forEach(btn => btn.addEventListener('click', e => handleBookingAction(e.currentTarget.dataset.id, 'reschedule')));
        queryAll('.cancel-booking-btn').forEach(btn => btn.addEventListener('click', e => handleBookingAction(e.currentTarget.dataset.id, 'cancel')));
    }
    
    function handleBookingAction(bookingId, action) {
        const id = parseInt(bookingId);
        const bookingIndex = data.bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) return;

        switch(action) {
            case 'confirm':
                data.bookings[bookingIndex].status = 'Confirmed';
                alert('Booking confirmed!');
                break;
            case 'reschedule':
                openBookingModal(data.bookings[bookingIndex]);
                break;
            case 'cancel':
                if (confirm('Are you sure you want to cancel this booking? This cannot be undone.')) {
                    data.bookings.splice(bookingIndex, 1);
                    alert('Booking cancelled.');
                }
                break;
        }
        render();
    }
    
    // --- CLIENTS & STAFF PAGE ---
    function renderClientsAndStaff() {
        const page = getEl('Clients');
        page.innerHTML = `
            <div class="card">
                <div class="tabs">
                    <div class="tab-link active" data-tab="clients-tab">Clients</div>
                    <div class="tab-link" data-tab="staff-tab">Staff</div>
                </div>
                <div id="clients-tab" class="tab-content active"></div>
                <div id="staff-tab" class="tab-content"></div>
            </div>`;
        renderClientsTab();
        renderStaffTab();
        
        queryAll('.tab-link').forEach(tab => {
            tab.addEventListener('click', () => {
                queryAll('.tab-link, .tab-content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                getEl(tab.dataset.tab).classList.add('active');
            });
        });
    }

    function renderClientsTab() {
        const container = getEl('clients-tab');
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0;">
                <h3>Client List (${data.clients.length})</h3>
                <button id="add-client-btn" class="button button-primary"><i data-lucide="plus"></i> Add Client</button>
            </div>
            <div class="client-card-grid">
                ${data.clients.map(client => `
                    <div class="card client-card">
                        <div class="client-card-header">
                            <div class="avatar" style="background-color: ${nameToColor(client.name)};">${getInitials(client.name)}</div>
                            <div>
                                <p style="font-weight: bold; color: var(--color-primary);">${client.name}</p>
                                <small class="tag">${client.level}</small>
                            </div>
                        </div>
                        <div class="client-card-info">
                            <p><strong>Total Visits:</strong> ${client.totalVisits}</p>
                            <p><strong>Last Visit:</strong> ${client.lastVisit || 'N/A'}</p>
                            <p><strong>Notes:</strong> ${client.notes || 'None'}</p>
                        </div>
                        <button class="button button-outline view-client-details-btn" data-id="${client.id}" style="margin-top: auto;">Edit Details</button>
                    </div>`).join('')}
            </div>`;
        getEl('add-client-btn').addEventListener('click', () => openClientModal());
        queryAll('.view-client-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openClientModal(parseInt(e.currentTarget.dataset.id)));
        });
    }

    function renderStaffTab() {
        const container = getEl('staff-tab');
        container.innerHTML = `
            <div style="margin: 16px 0;"><h3>Staff Team (${data.staff.length})</h3></div>
            <div class="client-card-grid">
                ${data.staff.map(s => `
                    <div class="card client-card">
                        <div class="client-card-header">
                            <div class="avatar" style="background-color: ${nameToColor(s.name)};">${getInitials(s.name)}</div>
                            <div>
                                <p style="font-weight: bold; color: var(--color-primary);">${s.name}</p>
                                <small>${s.role}</small>
                            </div>
                        </div>
                         <div class="client-card-info">
                            <p><strong>Schedule:</strong> ${s.schedule}</p>
                        </div>
                        <button class="button button-outline view-staff-details-btn" data-id="${s.id}" style="margin-top: auto;">Edit Details</button>
                    </div>`).join('')}
                <div class="card item-card add-new-card" id="add-staff-btn">
                    <i data-lucide="plus-circle"></i>
                    <p>Add New Staff</p>
                </div>
            </div>`;
        getEl('add-staff-btn').addEventListener('click', () => openStaffModal());
        queryAll('.view-staff-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openStaffModal(parseInt(e.currentTarget.dataset.id)));
        });
    }

    // --- SERVICES PAGE ---
    function renderServices(filters = {}) {
        const page = getEl('Services');
        let servicesToDisplay = [...data.services];
        if (filters.price) {
            servicesToDisplay.sort((a, b) => filters.price === 'asc' ? a.price - b.price : b.price - a.price);
        }
        if (filters.duration) {
            servicesToDisplay.sort((a, b) => filters.duration === 'asc' ? a.duration - b.duration : b.duration - a.duration);
        }
        
        page.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3>Our Services</h3>
                    <button id="add-service-btn" class="button button-primary"><i data-lucide="plus"></i> Add New Service</button>
                </div>
                <div class="service-filters">
                    <label>Sort by Price:</label><select id="price-filter"><option value="">Default</option><option value="asc">Low to High</option><option value="desc">High to Low</option></select>
                    <label>Sort by Duration:</label><select id="duration-filter"><option value="">Default</option><option value="asc">Shortest to Longest</option><option value="desc">Longest to Shortest</option></select>
                </div>
                <div class="client-card-grid" style="margin-top: 24px;">
                ${servicesToDisplay.map(s => {
                    const bookingCount = data.bookings.filter(b => b.serviceId === s.id).length;
                    const revenue = bookingCount * s.price;
                    return `
                    <div class="card client-card">
                        <div class="client-card-header">
                            <p style="font-weight: bold; color: var(--color-primary); font-size: 1.2rem;">${s.name}</p>
                        </div>
                         <div class="client-card-info">
                            <p>${s.description}</p>
                            <div style="display: flex; gap: 8px; margin: 8px 0;">${s.tags.map(t => `<small class="tag">${t}</small>`).join('')}</div>
                            <p><strong>Price:</strong> ₱${s.price.toFixed(2)}</p>
                            <p><strong>Duration:</strong> ${s.duration} mins</p>
                            <p><strong>Analysis:</strong> Booked ${bookingCount} time(s), generating ₱${revenue.toFixed(2)}</p>
                        </div>
                        <button class="button button-outline edit-service-btn" data-id="${s.id}" style="margin-top: auto;">Edit</button>
                    </div>`}).join('')}
                </div>
            </div>`;
        getEl('add-service-btn').addEventListener('click', () => openServiceModal());
        queryAll('.edit-service-btn').forEach(btn => btn.addEventListener('click', (e) => openServiceModal(parseInt(e.currentTarget.dataset.id))));
        
        const priceFilter = getEl('price-filter');
        const durationFilter = getEl('duration-filter');
        priceFilter.value = filters.price || '';
        durationFilter.value = filters.duration || '';
        priceFilter.addEventListener('change', (e) => renderServices({ ...filters, price: e.target.value }));
        durationFilter.addEventListener('change', (e) => renderServices({ ...filters, duration: e.target.value }));
    }

    // --- REPORTS PAGE ---
    function renderReports() {
        const page = getEl('Reports');
        const staffOptions = data.staff.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        page.innerHTML = `
            <div class="card">
                <h3>Sales Report</h3>
                <div class="report-filters">
                    <label for="start-date">From:</label>
                    <input type="date" id="start-date">
                    <label for="end-date">To:</label>
                    <input type="date" id="end-date">
                    <label for="report-staff-filter">Staff Member:</label>
                    <select id="report-staff-filter"><option value="all">All Staff</option>${staffOptions}</select>
                    <button id="generate-report-btn" class="button button-primary">Generate Report</button>
                </div>
                <div id="report-results"></div>
            </div>`;
        
        getEl('generate-report-btn').addEventListener('click', generateSalesReport);
    }
    
    function generateSalesReport() {
        const resultsContainer = getEl('report-results');
        const startDate = getEl('start-date').value;
        const endDate = getEl('end-date').value;
        const staffId = getEl('report-staff-filter').value;

        if (!startDate || !endDate) {
            resultsContainer.innerHTML = `<p style="color: #f00;">Please select both a start and end date.</p>`;
            return;
        }

        let filteredBookings = data.bookings.filter(b => {
            return b.date >= startDate && b.date <= endDate && b.status === 'Confirmed';
        });

        if (staffId !== 'all') {
            filteredBookings = filteredBookings.filter(b => b.staffId === parseInt(staffId));
        }

        let totalRevenue = 0;
        let totalEarnings = 0; // Assuming 80% margin for earnings

        const tableRows = filteredBookings.map(booking => {
            const service = data.services.find(s => s.id === booking.serviceId);
            const staff = data.staff.find(s => s.id === booking.staffId);
            const revenue = service ? service.price : 0;
            const earnings = revenue * 0.8;
            totalRevenue += revenue;
            totalEarnings += earnings;
            return `
                <tr>
                    <td>${booking.date}</td>
                    <td>${booking.client}</td>
                    <td>${service ? service.name : 'N/A'}</td>
                    <td>${staff ? staff.name : 'N/A'}</td>
                    <td>₱${revenue.toFixed(2)}</td>
                    <td>₱${earnings.toFixed(2)}</td>
                </tr>`;
        }).join('');

        resultsContainer.innerHTML = `
            <h4 style="margin-top: 24px;">Report from ${startDate} to ${endDate}</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Staff</th>
                        <th>Revenue</th>
                        <th>Est. Earnings</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="4">Total</td>
                        <td>₱${totalRevenue.toFixed(2)}</td>
                        <td>₱${totalEarnings.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>`;
    }

    // --- SETTINGS PAGE ---
    function renderSettings() {
        const page = getEl('Settings');
        page.innerHTML = `
            <div id="settings-page-container">
                <div class="card">
                    <h2 style="color: var(--color-primary); margin-bottom: 16px;">General</h2>
                    <div class="setting-item">
                        <div><p><strong>Theme</strong></p><small>Toggle between light and dark mode.</small></div>
                        <label class="switch"><input type="checkbox" id="settings-theme-toggle" ${currentTheme === 'dark' ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                    <div class="setting-item">
                        <div><p><strong>Language</strong></p><small>Set the display language for the dashboard.</small></div>
                        <select style="width: auto;"><option>English</option><option disabled>Filipino (Soon)</option></select>
                    </div>
                </div>
                <div class="card">
                    <h2 style="color: var(--color-primary); margin-bottom: 16px;">Security</h2>
                    <div class="setting-item">
                        <div><p><strong>Change Team Password</strong></p><small>Update the password for team access.</small></div>
                        <button id="change-password-btn" class="button button-outline">Change Password</button>
                    </div>
                </div>
                 <div class="card">
                    <h2 style="color: var(--color-primary); margin-bottom: 16px;">Notifications</h2>
                    <div class="setting-item">
                        <div><p><strong>Email Notifications</strong></p><small>Receive an email for each new booking.</small></div>
                        <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                    </div>
                    <div class="setting-item">
                        <div><p><strong>Daily Summary</strong></p><small>Get a daily summary of appointments via email.</small></div>
                         <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                    </div>
                </div>
            </div>`;
        getEl('settings-theme-toggle').addEventListener('change', (e) => {
            currentTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.className = currentTheme;
            localStorage.setItem('tyche-theme', currentTheme);
        });
        getEl('change-password-btn').addEventListener('click', handleChangePassword);
    }
    
    function handleChangePassword() {
        const currentPass = prompt("For security, please enter your current team password:");
        if (currentPass === null) return;
        if (currentPass !== localStorage.getItem('tyche-team-password')) {
            alert("Incorrect password. Please try again.");
            return;
        }
        const newPass = prompt("Enter your new password (min 6 characters):");
        if (!newPass || newPass.length < 6) {
            alert("Invalid new password. It must be at least 6 characters long.");
            return;
        }
        const confirmPass = prompt("Confirm your new password:");
        if (newPass !== confirmPass) {
            alert("Passwords do not match.");
            return;
        }
        localStorage.setItem('tyche-team-password', newPass);
        teamPassword = newPass;
        alert("Password changed successfully!");
    }

    // --- MODAL HANDLERS ---
    function openBookingModal(booking = null) {
        bookingModal.classList.add('active');
        const staffSelect = getEl('staff-select');
        staffSelect.innerHTML = data.staff.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        const serviceSelect = getEl('service-select');
        serviceSelect.innerHTML = data.services.map(s => `<option value="${s.id}">${s.name} - ₱${s.price}</option>`).join('');
        bookingForm.reset();
        
        if (booking) {
            getEl('modal-title').textContent = 'Edit Booking';
            getEl('booking-id').value = booking.id;
            getEl('client-name').value = booking.client;
            getEl('booking-date').value = booking.date;
            getEl('start-time').value = booking.startTime;
            getEl('end-time').value = booking.endTime;
            serviceSelect.value = booking.serviceId;
            staffSelect.value = booking.staffId;
        } else {
            getEl('modal-title').textContent = 'New Booking';
            getEl('booking-id').value = '';
        }
    }
    
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bookingId = getEl('booking-id').value;
        const bookingData = {
            client: getEl('client-name').value,
            date: getEl('booking-date').value,
            startTime: getEl('start-time').value,
            endTime: getEl('end-time').value,
            staffId: parseInt(getEl('staff-select').value),
            serviceId: parseInt(getEl('service-select').value),
            status: 'Pending'
        };

        if (bookingId) {
            const index = data.bookings.findIndex(b => b.id === parseInt(bookingId));
            data.bookings[index] = { ...data.bookings[index], ...bookingData };
        } else {
            const newBooking = { id: Date.now(), ...bookingData };
            data.bookings.push(newBooking);
            if (!data.clients.some(c => c.name.toLowerCase() === newBooking.client.toLowerCase())) {
                data.clients.push({ id: Date.now(), name: newBooking.client, level: 'New', totalVisits: 1, notes: "" });
            }
        }
        
        bookingModal.classList.remove('active');
        render();
    });
    getEl('cancel-booking').addEventListener('click', () => bookingModal.classList.remove('active'));

    function openClientModal(clientId = null) {
        const client = clientId ? data.clients.find(c => c.id === clientId) : null;
        clientModal.classList.add('active');
        const title = client ? 'Edit Client Details' : 'Add New Client';
        
        clientModal.querySelector('.modal-title').textContent = title;
        const clientNameInput = getEl('new-client-name');
        const clientLevelSelect = getEl('new-client-level');
        
        let notesTextarea = getEl('client-notes');
        if (!notesTextarea) {
            const form = clientModal.querySelector('form');
            const notesLabel = document.createElement('label');
            notesLabel.htmlFor = 'client-notes';
            notesLabel.textContent = 'Notes';
            notesTextarea = document.createElement('textarea');
            notesTextarea.id = 'client-notes';
            notesTextarea.placeholder = 'Client notes...';
            form.insertBefore(notesLabel, form.querySelector('.modal-actions'));
            form.insertBefore(notesTextarea, form.querySelector('.modal-actions'));
        }

        if (client) {
            clientNameInput.value = client.name;
            clientLevelSelect.value = client.level;
            notesTextarea.value = client.notes;
        } else {
            clientForm.reset();
            notesTextarea.value = '';
        }

        clientForm.onsubmit = (e) => {
            e.preventDefault();
            const clientData = {
                name: clientNameInput.value,
                level: clientLevelSelect.value,
                notes: notesTextarea.value,
            };

            if (client) {
                const index = data.clients.findIndex(c => c.id === clientId);
                data.clients[index] = { ...data.clients[index], ...clientData };
            } else {
                data.clients.push({ id: Date.now(), totalVisits: 0, lastVisit: null, ...clientData });
            }
            clientModal.classList.remove('active');
            render();
        };
    }
    getEl('cancel-client').addEventListener('click', () => clientModal.classList.remove('active'));

    function openStaffModal(staffId = null) {
        const staff = staffId ? data.staff.find(s => s.id === staffId) : null;
        genericModal.classList.add('active');
        const title = staff ? 'Edit Staff Details' : 'Add New Staff Member';
        
        genericModal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">${title}</h2>
                <form id="generic-form">
                    <label for="staff-name">Name</label>
                    <input type="text" id="staff-name" required value="${staff ? staff.name : ''}">
                    <label for="staff-role">Role</label>
                    <input type="text" id="staff-role" required value="${staff ? staff.role : ''}">
                    <label for="staff-schedule">Schedule</label>
                    <input type="text" id="staff-schedule" required value="${staff ? staff.schedule : ''}">
                    <div class="modal-actions">
                        <button type="button" id="cancel-generic" class="button button-outline">Cancel</button>
                        <button type="submit" class="button button-primary">Save</button>
                    </div>
                </form>
            </div>`;
        
        getEl('cancel-generic').addEventListener('click', () => genericModal.classList.remove('active'));
        getEl('generic-form').onsubmit = (e) => {
            e.preventDefault();
            const staffData = {
                name: getEl('staff-name').value,
                role: getEl('staff-role').value,
                schedule: getEl('staff-schedule').value
            };
            if (staff) {
                const index = data.staff.findIndex(s => s.id === staffId);
                data.staff[index] = { ...data.staff[index], ...staffData };
            } else {
                data.staff.push({ id: Date.now(), ...staffData });
            }
            genericModal.classList.remove('active');
            render();
        };
    }

    function openServiceModal(serviceId = null) {
        const service = serviceId ? data.services.find(s => s.id === serviceId) : null;
        genericModal.classList.add('active');
        const title = service ? 'Edit Service' : 'Add New Service';
        
        genericModal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">${title}</h2>
                <form id="generic-form">
                    <label for="service-name">Name</label>
                    <input type="text" id="service-name" required value="${service ? service.name : ''}">
                    <label for="service-desc">Description</label>
                    <textarea id="service-desc">${service ? service.description : ''}</textarea>
                    <label for="service-price">Price (₱)</label>
                    <input type="number" id="service-price" required value="${service ? service.price : ''}">
                    <label for="service-duration">Duration (mins)</label>
                    <input type="number" id="service-duration" required value="${service ? service.duration : ''}">
                    <label for="service-tags">Tags (comma-separated)</label>
                    <input type="text" id="service-tags" value="${service ? service.tags.join(', ') : ''}">
                    <div class="modal-actions">
                        <button type="button" id="cancel-generic" class="button button-outline">Cancel</button>
                        <button type="submit" class="button button-primary">Save</button>
                    </div>
                </form>
            </div>`;
        
        getEl('cancel-generic').addEventListener('click', () => genericModal.classList.remove('active'));
        getEl('generic-form').onsubmit = (e) => {
            e.preventDefault();
            const serviceData = {
                name: getEl('service-name').value,
                description: getEl('service-desc').value,
                price: parseFloat(getEl('service-price').value),
                duration: parseInt(getEl('service-duration').value),
                tags: getEl('service-tags').value.split(',').map(t => t.trim()).filter(t => t)
            };
            if (service) {
                const index = data.services.findIndex(s => s.id === serviceId);
                data.services[index] = { ...data.services[index], ...serviceData };
            } else {
                data.services.push({ id: Date.now(), ...serviceData });
            }
            genericModal.classList.remove('active');
            render();
        };
    }

    // --- INITIALIZATION ---
    function init() {
        teamPassword = localStorage.getItem('tyche-team-password');
        if (teamPassword) {
            showLoginForm();
        } else {
            showCreatePasswordForm();
        }
    }

    init();
});





document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentsTableBody = document.querySelector('#appointments-table tbody');
    const clientSelect = document.getElementById('client-select');

    // Fetch and populate clients in the dropdown
    async function loadClients() {
        try {
            const response = await fetch('/api/clients');
            const clients = await response.json();
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.client_id;
                option.textContent = client.client_name;
                clientSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load clients:', error);
        }
    }

    // Fetch and display appointments
    async function loadAppointments() {
        try {
            const response = await fetch('/api/appointments');
            const appointments = await response.json();
            appointmentsTableBody.innerHTML = ''; // Clear existing rows
            appointments.forEach(app => {
                const row = document.createElement('tr');
                const formattedDate = new Date(app.appointment_time).toLocaleString();
                row.innerHTML = `
                    <td>${app.client_name}</td>
                    <td>${app.service}</td>
                    <td>${formattedDate}</td>
                    <td>${app.staff}</td>
                `;
                appointmentsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load appointments:', error);
        }
    }

    // Handle form submission
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const appointmentData = {
            clientId: document.getElementById('client-select').value,
            date: document.getElementById('date-input').value,
            time: document.getElementById('time-input').value,
            service: document.getElementById('service-select').value,
            staff: document.getElementById('staff-select').value,
        };

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (response.ok) {
                loadAppointments(); // Refresh the list
                appointmentForm.reset();
            } else {
                alert('Failed to book appointment.');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
        }
    });

    // Initial load
    loadClients();
    loadAppointments();
});