/**
 * Quantum Enterprise OS v6 - Core Engine
 * Clean architecture: State → Storage → Render → Events
 */

const Q = (() => {

    // ─── i18n Dictionary ──────────────────────────────────────────────────────
    const DICT = {
        ar: {
            'nav-dash':'لوحة القيادة','nav-tasks':'المهام','nav-settings':'الإعدادات',
            'dash-title':'📈 لوحة القيادة','dash-sub':'مراقبة حية وتحليلات إنتاجية فورية',
            'tasks-title':'🗂️ إدارة المهام','tasks-sub':'إنشاء ومتابعة المهام في مكان واحد',
            'settings-title':'⚙️ الإعدادات','settings-sub':'تخصيص المنصة وإدارة البيانات',
            'kpi-total':'إجمالي المهام','kpi-done':'مكتملة','kpi-progress':'قيد التنفيذ','kpi-overdue':'متأخرة',
            'prod-score':'الإنتاجية','weekly-stats':'إحصائيات','weekly-chart':'منجزات الأسبوع',
            'high-tasks':'عالية','med-tasks':'متوسطة','low-tasks':'منخفضة',
            'achievements':'الإنجازات','kanban-title':'لوحة Kanban','btn-add':'مهمة جديدة',
            'activity-log':'سجل النشاط','btn-clear':'مسح',
            'create-task':'إنشاء مهمة','lbl-title':'اسم المهمة','lbl-desc':'الوصف',
            'lbl-cat':'التصنيف','lbl-priority':'الأولوية','lbl-deadline':'التاريخ','btn-create':'إنشاء المهمة',
            'daily-board':'لوحة اليوم','future-tasks':'المهام المستقبلية',
            'prefs-title':'التفضيلات','s-lang':'اللغة','s-lang-desc':'العربية أو الإنجليزية',
            's-theme':'المظهر','s-theme-desc':'الوضع الداكن أو الفاتح',
            'data-stats':'إحصائيات البيانات','stat-total':'إجمالي المهام','stat-logs':'السجلات','stat-cats':'التصنيفات',
            'danger-zone':'منطقة الخطر','danger-desc':'Soft Reset يعيد الإعدادات فقط. Full Reset يمسح كل شيء.',
            'btn-export':'تصدير البيانات','btn-reset':'إعادة الضبط',
            'toast-created':'✅ تم إنشاء المهمة بنجاح!','toast-updated':'⚡ تم حفظ التعديلات!',
            'toast-deleted':'🗑️ تم حذف المهمة!','toast-overdue':'⚠️ تم رصد مهام متأخرة!',
            'toast-reset-soft':'🔄 تم إعادة ضبط الإعدادات!','toast-reset-full':'💥 تم مسح كل البيانات!',
            'toast-exported':'📦 تم تصدير البيانات!',
            'empty-kanban':'لا توجد مهام','empty-daily':'لا توجد مهام لهذا اليوم',
            'days':['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
            'days-short':['أحد','اثن','ثلا','أرب','خمي','جمع','سبت'],
        },
        en: {
            'nav-dash':'Dashboard','nav-tasks':'Tasks','nav-settings':'Settings',
            'dash-title':'📈 Dashboard','dash-sub':'Live monitoring and real-time productivity analytics',
            'tasks-title':'🗂️ Task Management','tasks-sub':'Create and track tasks in one place',
            'settings-title':'⚙️ Settings','settings-sub':'Customize the platform and manage data',
            'kpi-total':'Total Tasks','kpi-done':'Completed','kpi-progress':'In Progress','kpi-overdue':'Overdue',
            'prod-score':'Productivity','weekly-stats':'Stats','weekly-chart':'Weekly Output',
            'high-tasks':'High','med-tasks':'Medium','low-tasks':'Low',
            'achievements':'Achievements','kanban-title':'Kanban Board','btn-add':'New Task',
            'activity-log':'Activity Log','btn-clear':'Clear',
            'create-task':'Create Task','lbl-title':'Task Title','lbl-desc':'Description',
            'lbl-cat':'Category','lbl-priority':'Priority','lbl-deadline':'Deadline','btn-create':'Create Task',
            'daily-board':'Daily Board','future-tasks':'Future Tasks',
            'prefs-title':'Preferences','s-lang':'Language','s-lang-desc':'Arabic or English',
            's-theme':'Theme','s-theme-desc':'Dark or light mode',
            'data-stats':'Data Statistics','stat-total':'Total Tasks','stat-logs':'Log Entries','stat-cats':'Categories',
            'danger-zone':'Danger Zone','danger-desc':'Soft Reset restores defaults only. Full Reset clears everything.',
            'btn-export':'Export Data','btn-reset':'System Reset',
            'toast-created':'✅ Task created!','toast-updated':'⚡ Changes saved!',
            'toast-deleted':'🗑️ Task deleted!','toast-overdue':'⚠️ Overdue tasks detected!',
            'toast-reset-soft':'🔄 Settings reset!','toast-reset-full':'💥 All data cleared!',
            'toast-exported':'📦 Data exported!',
            'empty-kanban':'No tasks','empty-daily':'No tasks for this day',
            'days':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            'days-short':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        }
    };

    // ─── Kanban Columns Config ─────────────────────────────────────────────────
    const KANBAN_COLS = [
        { id:'Backlog',      label:'Backlog',       labelAr:'Backlog',      dot:'#64748b' },
        { id:'Not Started',  label:'Not Started',   labelAr:'لم تبدأ',      dot:'#94a3b8' },
        { id:'In Progress',  label:'In Progress',   labelAr:'قيد التنفيذ',  dot:'#f59e0b' },
        { id:'Under Review', label:'Under Review',  labelAr:'مراجعة',       dot:'#3b82f6' },
        { id:'Completed',    label:'Completed',     labelAr:'مكتملة',       dot:'#10b981' },
    ];

    // ─── State ─────────────────────────────────────────────────────────────────
    const S = {
        tasks:   [],
        logs:    [],
        lang:    localStorage.getItem('q_lang')  || 'ar',
        theme:   localStorage.getItem('q_theme') || 'dark',
        dailyDate: new Date().toISOString().split('T')[0],
        dailyView: 'grid',
        resetMode: 'soft',
        dragId: null,
    };

    // ─── Storage ───────────────────────────────────────────────────────────────
    const Storage = {
        load() {
            S.tasks = JSON.parse(localStorage.getItem('q_tasks') || '[]');
            S.logs  = JSON.parse(localStorage.getItem('q_logs')  || '[]');
            Storage._checkOverdue();
        },
        save() {
            localStorage.setItem('q_tasks', JSON.stringify(S.tasks));
            Render.all();
        },
        _checkOverdue() {
            const today = _today();
            let changed = false;
            S.tasks.forEach(t => {
                if (t.status !== 'Completed' && t.deadline < today) {
                    t.isOverdue = true;
                    changed = true;
                }
            });
            if (changed) {
                localStorage.setItem('q_tasks', JSON.stringify(S.tasks));
                setTimeout(() => Toast.show(t('toast-overdue'), 'warning'), 800);
            }
        },
        pushLog(op, ar, en) {
            const entry = {
                id: Date.now().toString(),
                op, ar, en,
                ts: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
            };
            S.logs.unshift(entry);
            if (S.logs.length > 50) S.logs.pop();
            localStorage.setItem('q_logs', JSON.stringify(S.logs));
            Render.logs();
        },
        clearLogs() {
            S.logs = [];
            localStorage.setItem('q_logs', '[]');
            Render.logs();
        }
    };

    // ─── Rendering ─────────────────────────────────────────────────────────────
    const Render = {
        all() {
            Render.kpis();
            Render.productivity();
            Render.weekChart();
            Render.achievements();
            Render.kanban();
            Render.logs();
            Render.dailyBoard();
            Render.futureTasks();
            Render.settingsStats();
            Render.dailyCategoryFilter();
        },
        kpis() {
            const total    = S.tasks.length;
            const done     = S.tasks.filter(t => t.status === 'Completed').length;
            const progress = S.tasks.filter(t => t.status === 'In Progress').length;
            const overdue  = S.tasks.filter(t => t.isOverdue && t.status !== 'Completed').length;
            const todayTasks = S.tasks.filter(t => t.deadline === _today()).length;

            _set('kpi-total', total);
            _set('kpi-done', done);
            _set('kpi-progress', progress);
            _set('kpi-overdue', overdue);
            _set('kpi-total-sub', `${todayTasks} مهمة اليوم`);
            _set('kpi-done-sub', total ? `${Math.round(done/total*100)}% إنجاز` : '—');
            _set('kpi-today-sub', `${progress} نشطة`);
            _set('kpi-overdue-sub', overdue > 0 ? '⚠️ تحتاج انتباه' : '✓ جيد');
        },
        productivity() {
            const total = S.tasks.length;
            const done  = S.tasks.filter(t => t.status === 'Completed').length;
            const pct   = total === 0 ? 0 : Math.round(done / total * 100);
            const circ  = 2 * Math.PI * 38;
            const offset = circ - (pct / 100) * circ;

            const ring = document.getElementById('prod-ring');
            if (ring) { ring.style.strokeDasharray = circ; ring.style.strokeDashoffset = offset; }
            _set('prod-pct', `${pct}%`);

            _set('r-high', S.tasks.filter(t => t.priority === 'High').length);
            _set('r-med',  S.tasks.filter(t => t.priority === 'Medium').length);
            _set('r-low',  S.tasks.filter(t => t.priority === 'Low').length);
        },
        weekChart() {
            const el = document.getElementById('week-chart');
            if (!el) return;

            const today = new Date();
            const days  = DICT[S.lang]['days-short'];
            const data  = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const ds = d.toISOString().split('T')[0];
                const count = S.tasks.filter(t => t.status === 'Completed' && t.deadline === ds).length;
                data.push({ day: days[d.getDay()], count, ds });
            }

            const max = Math.max(...data.map(d => d.count), 1);
            el.innerHTML = data.map(d => `
                <div class="week-bar-wrap">
                    <div class="week-num">${d.count || ''}</div>
                    <div class="week-bar ${d.count > 0 ? 'has-data' : ''}" style="height:${Math.max((d.count/max)*64, d.count ? 8 : 4)}px" title="${d.count} tasks"></div>
                    <div class="week-day">${d.day}</div>
                </div>
            `).join('');
        },
        achievements() {
            const el = document.getElementById('achievements');
            if (!el) return;

            const done  = S.tasks.filter(t => t.status === 'Completed').length;
            const total = S.tasks.length;

            const list = [
                { icon:'🚀', name:'First Launch',    desc:'أنشأت أول مهمة',     earned: total >= 1 },
                { icon:'⚡', name:'Quick Start',     desc:'أكملت 3 مهام',       earned: done >= 3 },
                { icon:'🔥', name:'On Fire',         desc:'أكملت 10 مهام',      earned: done >= 10 },
                { icon:'💎', name:'Diamond',         desc:'أكملت 25 مهمة',     earned: done >= 25 },
                { icon:'🎯', name:'Focused',         desc:'لا مهام متأخرة',     earned: S.tasks.length > 0 && S.tasks.filter(t=>t.isOverdue&&t.status!=='Completed').length === 0 },
                { icon:'📋', name:'Organizer',       desc:'5 تصنيفات مختلفة',   earned: new Set(S.tasks.map(t=>t.category)).size >= 5 },
            ];

            el.innerHTML = list.map(a => `
                <div class="achievement ${a.earned ? 'earned' : ''}">
                    <div class="achievement-icon">${a.icon}</div>
                    <div><div class="achievement-name">${a.name}</div><div class="achievement-desc">${a.desc}</div></div>
                </div>
            `).join('');
        },
        kanban() {
            const el = document.getElementById('kanban-board');
            if (!el) return;
            el.innerHTML = '';

            KANBAN_COLS.forEach(col => {
                const tasks = S.tasks.filter(t => t.status === col.id);
                const colEl = document.createElement('div');
                colEl.className = 'kanban-col';
                colEl.dataset.status = col.id;
                colEl.innerHTML = `
                    <div class="kanban-col-header">
                        <div class="kanban-col-title">
                            <span class="kanban-col-dot" style="background:${col.dot}"></span>
                            ${S.lang === 'ar' ? col.labelAr : col.label}
                        </div>
                        <span class="kanban-count">${tasks.length}</span>
                    </div>
                    <div class="kanban-cards" id="kcol-${col.id.replace(/ /g,'_')}">
                        ${tasks.length === 0 ? `<div class="kanban-empty">${t('empty-kanban')}</div>` : ''}
                    </div>
                `;
                const cardsEl = colEl.querySelector('.kanban-cards');
                tasks.forEach(task => cardsEl.appendChild(_makeKanbanCard(task)));

                // drag-over events
                colEl.addEventListener('dragover', e => { e.preventDefault(); colEl.classList.add('drag-over'); });
                colEl.addEventListener('dragleave', () => colEl.classList.remove('drag-over'));
                colEl.addEventListener('drop', e => {
                    e.preventDefault();
                    colEl.classList.remove('drag-over');
                    if (!S.dragId) return;
                    const task = S.tasks.find(t => t.id === S.dragId);
                    if (task && task.status !== col.id) {
                        task.status = col.id;
                        if (col.id === 'Completed') task.isOverdue = false;
                        Storage.pushLog('DRAG', `نقل [${task.title}] → ${col.labelAr}`, `Moved [${task.title}] → ${col.label}`);
                        Storage.save();
                        Toast.show(t('toast-updated'));
                    }
                });

                el.appendChild(colEl);
            });
        },
        logs() {
            const el = document.getElementById('log-container');
            if (!el) return;
            if (S.logs.length === 0) {
                el.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:0.82rem;">لا يوجد سجلات</div>';
                return;
            }
            el.innerHTML = S.logs.slice(0, 20).map(l => `
                <div class="log-item">
                    <span class="log-op">${l.op}</span>
                    <span class="log-msg">${S.lang === 'ar' ? l.ar : l.en}</span>
                    <span class="log-time">${l.ts}</span>
                </div>
            `).join('');
        },
        dailyBoard() {
            const el = document.getElementById('daily-board-content');
            const dateEl = document.getElementById('daily-date-display');
            if (!el) return;

            const d = new Date(S.dailyDate + 'T00:00:00');
            const dayName = DICT[S.lang]['days'][d.getDay()];
            if (dateEl) dateEl.textContent = `${dayName} ${S.dailyDate}`;

            const pFilter = document.getElementById('db-filter-priority')?.value || '';
            const sFilter = document.getElementById('db-filter-status')?.value || '';
            const cFilter = document.getElementById('db-filter-cat')?.value || '';

            let tasks = S.tasks.filter(t => t.deadline === S.dailyDate);
            if (pFilter) tasks = tasks.filter(t => t.priority === pFilter);
            if (sFilter) tasks = tasks.filter(t => t.status === sFilter);
            if (cFilter) tasks = tasks.filter(t => t.category === cFilter);

            if (tasks.length === 0) {
                el.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:0.85rem;">${t('empty-daily')}</div>`;
                return;
            }

            if (S.dailyView === 'grid') {
                el.innerHTML = `<div class="daily-grid">${tasks.map(t => _makeDailyCard(t)).join('')}</div>`;
            } else {
                el.innerHTML = `
                    <table class="task-table">
                        <thead><tr>
                            <th>المهمة</th><th>التصنيف</th><th>الأولوية</th><th>الحالة</th><th>إجراءات</th>
                        </tr></thead>
                        <tbody>${tasks.map(t => `
                            <tr>
                                <td><b>${t.title}</b><div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${t.desc || ''}</div></td>
                                <td><span class="tag tag-accent">${t.category}</span></td>
                                <td><span class="tag tag-${t.priority.toLowerCase()}">${t.priority}</span></td>
                                <td style="font-size:0.8rem;">${t.status}</td>
                                <td>
                                    <div class="task-actions">
                                        <button class="action-btn success" onclick="Q.Tasks.quickComplete('${t.id}')" title="إتمام"><i class="fa fa-check"></i></button>
                                        <button class="action-btn" onclick="Q.Tasks.openModal('${t.id}')" title="تعديل"><i class="fa fa-pen"></i></button>
                                        <button class="action-btn danger" onclick="Q.Tasks.delete('${t.id}')" title="حذف"><i class="fa fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                `;
            }
        },
        futureTasks() {
            const el = document.getElementById('future-tasks-grid');
            if (!el) return;
            const today = _today();
            const tasks = S.tasks.filter(t => t.deadline > today && t.status !== 'Completed');
            if (tasks.length === 0) {
                el.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:32px;font-size:0.85rem;">لا توجد مهام مستقبلية</div>';
                return;
            }
            el.innerHTML = tasks.map(t => _makeDailyCard(t)).join('');
        },
        settingsStats() {
            _set('stat-total', S.tasks.length);
            _set('stat-logs', S.logs.length);
            _set('stat-cats', new Set(S.tasks.map(t => t.category).filter(Boolean)).size);
        },
        dailyCategoryFilter() {
            const el = document.getElementById('db-filter-cat');
            if (!el) return;
            const cats = [...new Set(S.tasks.map(t => t.category).filter(Boolean))];
            const current = el.value;
            el.innerHTML = `<option value="">كل التصنيفات</option>` +
                cats.map(c => `<option value="${c}" ${current === c ? 'selected' : ''}>${c}</option>`).join('');
        }
    };

    // ─── Card Builders ─────────────────────────────────────────────────────────
    function _makeKanbanCard(task) {
        const el = document.createElement('div');
        el.className = 'kanban-card';
        el.draggable = true;
        el.dataset.id = task.id;
        el.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span class="tag tag-${task.priority.toLowerCase()}">${task.priority}</span>
                ${task.isOverdue && task.status !== 'Completed' ? '<span style="color:var(--red);font-size:0.65rem;font-weight:800;">⚠ OVERDUE</span>' : ''}
            </div>
            <div class="kanban-card-title">${task.title}</div>
            <div class="kanban-card-meta">
                <span class="kanban-card-cat">${task.category}</span>
                <span style="font-size:0.68rem;">${task.deadline}</span>
            </div>
        `;
        el.addEventListener('dragstart', () => { S.dragId = task.id; el.classList.add('dragging'); });
        el.addEventListener('dragend', () => { S.dragId = null; el.classList.remove('dragging'); });
        el.addEventListener('click', () => Tasks.openModal(task.id));
        return el;
    }

    function _makeDailyCard(task) {
        const statusClass = { 'Not Started':'ns',  'Completed':'cp' }[task.status] || 'ns';
        return `
            <div class="daily-card ${task.isOverdue && task.status !== 'Completed' ? 'overdue' : ''} ${task.status === 'Completed' ? 'completed' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <span class="tag tag-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span style="display:flex;align-items:center;gap:4px;font-size:0.72rem;color:var(--text-secondary);">
                        <span class="status-dot ${statusClass}"></span>${task.status}
                    </span>
                </div>
                <div style="font-weight:800;font-size:0.88rem;margin-bottom:4px;">${task.title}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:2px;">${task.desc || ''}</div>
                <div style="margin-top:8px;"><span class="tag tag-accent">${task.category}</span></div>
                <div class="daily-card-actions">
                    ${task.status !== 'Completed' ? `<button class="action-btn success" onclick="Q.Tasks.quickComplete('${task.id}')" title="إتمام"><i class="fa fa-check"></i></button>` : ''}
                    <button class="action-btn" onclick="Q.Tasks.openModal('${task.id}')" title="تعديل"><i class="fa fa-pen"></i></button>
                    <button class="action-btn" onclick="Q.Tasks.reschedule('${task.id}')" title="إعادة جدولة"><i class="fa fa-calendar"></i></button>
                    <button class="action-btn danger" onclick="Q.Tasks.delete('${task.id}')" title="حذف"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        `;
    }

    // ─── Tasks CRUD ────────────────────────────────────────────────────────────
    const Tasks = {
        create(e) {
            e.preventDefault();
            const task = {
                id:        Date.now().toString(),
                title:     _val('f-title'),
                desc:      _val('f-desc'),
                category:  _val('f-cat'),
                priority:  _val('f-priority'),
                deadline:  _val('f-deadline'),
                status:    'Not Started',
                isOverdue: false,
                createdAt: Date.now(),
            };
            S.tasks.push(task);
            Storage.pushLog('ADD', `إضافة مهمة [${task.title}]`, `Task added: [${task.title}]`);
            Storage.save();
            Toast.show(t('toast-created'), 'success');
            e.target.reset();
            document.getElementById('f-deadline').value = _today();
        },
        openModal(id) {
            const task = S.tasks.find(t => t.id === id);
            if (!task) return;
            document.getElementById('m-id').value       = task.id;
            document.getElementById('m-title').value    = task.title;
            document.getElementById('m-desc').value     = task.desc || '';
            document.getElementById('m-cat').value      = task.category;
            document.getElementById('m-priority').value = task.priority;
            document.getElementById('m-status').value   = task.status;
            document.getElementById('m-deadline').value = task.deadline;
            Modal.open('task-modal');
        },
        saveModal(e) {
            e.preventDefault();
            const id = _val('m-id');
            const task = S.tasks.find(t => t.id === id);
            if (!task) return;

            task.title    = _val('m-title');
            task.desc     = _val('m-desc');
            task.category = _val('m-cat');
            task.priority = _val('m-priority');
            task.status   = _val('m-status');
            task.deadline = _val('m-deadline');

            if (task.status === 'Completed' || task.deadline >= _today()) task.isOverdue = false;

            Storage.pushLog('EDIT', `تعديل [${task.title}]`, `Edited: [${task.title}]`);
            Storage.save();
            Toast.show(t('toast-updated'));
            Modal.close('task-modal');
        },
        deleteFromModal() {
            const id = _val('m-id');
            Tasks.delete(id);
            Modal.close('task-modal');
        },
        delete(id) {
            const task = S.tasks.find(t => t.id === id);
            if (!task) return;
            S.tasks = S.tasks.filter(t => t.id !== id);
            Storage.pushLog('DEL', `حذف [${task.title}]`, `Deleted: [${task.title}]`);
            Storage.save();
            Toast.show(t('toast-deleted'), 'error');
        },
        quickComplete(id) {
            const task = S.tasks.find(t => t.id === id);
            if (!task) return;
            task.status = 'Completed';
            task.isOverdue = false;
            Storage.pushLog('DONE', `إتمام [${task.title}]`, `Completed: [${task.title}]`);
            Storage.save();
            Toast.show(t('toast-updated'), 'success');
        },
        reschedule(id) {
            const date = prompt('أدخل التاريخ الجديد (YYYY-MM-DD):', _today());
            if (!date) return;
            const task = S.tasks.find(t => t.id === id);
            if (!task) return;
            task.deadline = date;
            if (date >= _today()) task.isOverdue = false;
            Storage.pushLog('RESCHEDULE', `إعادة جدولة [${task.title}] → ${date}`, `Rescheduled [${task.title}] → ${date}`);
            Storage.save();
            Toast.show(t('toast-updated'));
        }
    };

    // ─── Daily Board ───────────────────────────────────────────────────────────
    const DailyBoard = {
        changeDay(delta) {
            const d = new Date(S.dailyDate + 'T00:00:00');
            d.setDate(d.getDate() + delta);
            S.dailyDate = d.toISOString().split('T')[0];
            Render.dailyBoard();
        },
        setView(view) {
            S.dailyView = view;
            document.getElementById('db-view-grid').classList.toggle('active', view === 'grid');
            document.getElementById('db-view-list').classList.toggle('active', view === 'list');
            Render.dailyBoard();
        },
        render() { Render.dailyBoard(); }
    };

    // ─── Router ────────────────────────────────────────────────────────────────
    const Router = {
        go(pageId, btn) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('page-' + pageId)?.classList.add('active');
            if (btn) btn.classList.add('active');
            if (pageId === 'settings') Render.settingsStats();
        }
    };

    // ─── Modal ─────────────────────────────────────────────────────────────────
    const Modal = {
        open(id)  { document.getElementById(id)?.classList.add('open'); },
        close(id) { document.getElementById(id)?.classList.remove('open'); }
    };

    // ─── Toast ─────────────────────────────────────────────────────────────────
    const Toast = {
        show(msg, type = 'success') {
            const hub = document.getElementById('toast-hub');
            const el  = document.createElement('div');
            el.className = `toast ${type}`;
            const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warning:'fa-triangle-exclamation' };
            el.innerHTML = `<i class="fa ${icons[type] || 'fa-bell'}" style="color:var(--${type === 'success' ? 'green' : type === 'error' ? 'red' : 'yellow'})"></i> <span>${msg}</span>`;
            hub.appendChild(el);
            setTimeout(() => { el.style.opacity='0'; el.style.transform='translateY(10px)'; setTimeout(() => el.remove(), 300); }, 3000);
        }
    };

    // ─── i18n ──────────────────────────────────────────────────────────────────
    const I18n = {
        setLang(lang) {
            S.lang = lang;
            localStorage.setItem('q_lang', lang);
            document.documentElement.setAttribute('lang', lang);
            document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (DICT[lang]?.[key]) el.textContent = DICT[lang][key];
            });
            const sel = document.getElementById('s-lang-select');
            if (sel) sel.value = lang;
            Render.all();
            Storage.pushLog('LANG', `اللغة: ${lang.toUpperCase()}`, `Language set to: ${lang.toUpperCase()}`);
        }
    };

    // ─── Interface / Theme ─────────────────────────────────────────────────────
    const Interface = {
        setTheme(theme) {
            S.theme = theme;
            localStorage.setItem('q_theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            const sel = document.getElementById('s-theme-select');
            if (sel) sel.value = theme;
            Storage.pushLog('THEME', `السمة: ${theme}`, `Theme set to: ${theme}`);
        }
    };

    // ─── Settings ──────────────────────────────────────────────────────────────
    const Settings = {
        selectReset(mode) {
            S.resetMode = mode;
            document.getElementById('reset-opt-soft').classList.toggle('selected', mode === 'soft');
            document.getElementById('reset-opt-full').classList.toggle('selected', mode === 'full');
            const warnEl = document.getElementById('reset-warn-text');
            if (warnEl) warnEl.textContent = mode === 'soft'
                ? 'سيتم إعادة ضبط الإعدادات فقط. المهام ستبقى محفوظة.'
                : '⚠️ سيتم مسح جميع المهام والسجلات والإعدادات بشكل نهائي!';
        },
        executeReset() {
            if (S.resetMode === 'full') {
                localStorage.clear();
                S.tasks = []; S.logs = [];
                Toast.show(t('toast-reset-full'), 'warning');
            } else {
                localStorage.removeItem('q_lang');
                localStorage.removeItem('q_theme');
                Toast.show(t('toast-reset-soft'));
            }
            Modal.close('reset-modal');
            S.lang  = 'ar';
            S.theme = 'dark';
            I18n.setLang('ar');
            Interface.setTheme('dark');
            Render.all();
        },
        exportData() {
            const data = { tasks: S.tasks, logs: S.logs, exported: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `quantum-backup-${_today()}.json`;
            a.click();
            Toast.show(t('toast-exported'));
        }
    };

    // ─── Dashboard ─────────────────────────────────────────────────────────────
    const Dashboard = {
        refresh() { Render.all(); Toast.show('✅ تم التحديث!', 'success'); }
    };

    // ─── Helpers ───────────────────────────────────────────────────────────────
    function t(key) { return DICT[S.lang]?.[key] || key; }
    function _today() { return new Date().toISOString().split('T')[0]; }
    function _val(id) { return document.getElementById(id)?.value || ''; }
    function _set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

    // ─── Boot ──────────────────────────────────────────────────────────────────
    function boot() {
        Storage.load();

        // Default deadline
        const dl = document.getElementById('f-deadline');
        if (dl) dl.value = _today();

        // Apply stored theme/lang
        document.documentElement.setAttribute('data-theme', S.theme);
        document.documentElement.setAttribute('dir', S.lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', S.lang);
        const thSel = document.getElementById('s-theme-select');
        const lgSel = document.getElementById('s-lang-select');
        if (thSel) thSel.value = S.theme;
        if (lgSel) lgSel.value = S.lang;

        // Apply i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (DICT[S.lang]?.[key]) el.textContent = DICT[S.lang][key];
        });

        Render.all();

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) overlay.classList.remove('open');
            });
        });

        // Keyboard: Escape closes modals
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        });

        // Auto-save: whenever tab/window loses focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) localStorage.setItem('q_tasks', JSON.stringify(S.tasks));
        });
    }

    document.addEventListener('DOMContentLoaded', boot);

    // ─── Public API ────────────────────────────────────────────────────────────
    return {
        Router, Modal, Tasks, DailyBoard, Dashboard,
        Storage, I18n, Interface, Settings,
        state: S  // dev access
    };

})();
