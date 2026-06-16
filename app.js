const siteNav = document.querySelector(".site-nav");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelectorAll(".nav-links a");

    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
      });
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = document.querySelectorAll("main section, .quick-strip, .card, .app-mock, .matrix");
    revealTargets.forEach((item) => item.classList.add("reveal"));
    document.querySelectorAll(".section-head h2").forEach((heading) => heading.classList.add("flow-cue"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((item) => item.classList.add("visible"));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

      revealTargets.forEach((item) => revealObserver.observe(item));
      requestAnimationFrame(() => {
        revealTargets.forEach((item) => {
          if (item.getBoundingClientRect().top < window.innerHeight * 0.95) item.classList.add("visible");
        });
      });
    }

    function alignHashTarget() {
      if (!location.hash) return;
      const target = document.querySelector(location.hash);
      if (target) {
        window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
        window.setTimeout(() => target.scrollIntoView({ block: "start" }), 180);
        window.setTimeout(() => target.scrollIntoView({ block: "start" }), 700);
      }
    }

    alignHashTarget();
    window.addEventListener("load", alignHashTarget);
    window.addEventListener("hashchange", alignHashTarget);

    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
        panels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
      });
    });

    const toast = document.querySelector(".copy-toast");
    let toastTimer;

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
    }

    function selectPromptText(element) {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function fallbackCopy(text, element) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copied) selectPromptText(element);
      return copied;
    }

    document.querySelectorAll(".copy").forEach((button) => {
      button.addEventListener("click", async () => {
        const copyBlock = button.closest(".prompt").querySelector("[data-copy]");
        const text = copyBlock.innerText;
        try {
          await navigator.clipboard.writeText(text);
          showToast("Copied prompt");
        } catch {
          showToast(fallbackCopy(text, copyBlock) ? "Copied prompt" : "Prompt selected");
        }
      });
    });

    const promptMoves = {
      outline: {
        title: "Create a presentation outline",
        copy: "Give Claude the audience, goal, raw notes, and desired number of slides. Ask for slide titles, takeaway headlines, visuals, and missing questions."
      },
      summarize: {
        title: "Summarize research or notes",
        copy: "Paste notes or upload a source. Ask for key findings, implications, caveats, open questions, and a short executive summary."
      },
      brief: {
        title: "Draft a campaign brief",
        copy: "Provide intake notes, campaign objective, audience, offer, channels, timing, and known constraints. Ask Claude to fill the structure and list missing inputs."
      },
      rewrite: {
        title: "Rewrite copy for an audience",
        copy: "Share the current copy, name the target audience, define the tone, and ask for 3 versions with a short rationale for each."
      },
      qa: {
        title: "Build a launch checklist",
        copy: "Describe the campaign type, channels, assets, systems, and deadline. Ask for a checklist grouped by owner, timing, and risk."
      },
      artifact: {
        title: "Create a reusable artifact",
        copy: "Ask Claude to create an artifact, name the artifact type, audience, and sections. Use this for checklists, guides, trackers, simple webpages, and templates."
      },
      cowork: {
        title: "Review a campaign folder",
        copy: "Use Cowork when Claude can access a selected folder. Give it the goal, allowed files, output format, and whether it may modify files or only report findings."
      },
      code: {
        title: "Handle a technical martech task",
        copy: "Use Claude Code when the work touches code, tracking, scripts, websites, tests, or repos. Ask it to explore first, plan, wait for approval, implement, and verify."
      }
    };

    const task = document.querySelector("#task");
    const resultTitle = document.querySelector("#result-title");
    const resultCopy = document.querySelector("#result-copy");

    if (task) task.addEventListener("change", () => {
      const selected = promptMoves[task.value];
      resultTitle.textContent = selected.title;
      resultCopy.textContent = selected.copy;
    });

    const ownershipScenarios = {
      launch: {
        title: "A campaign launch has missing UTMs and unclear final approval.",
        prompt: "Ask: What did we own too late? What should have been clarified earlier? Who owns the next action? What system change prevents this from repeating?"
      },
      builder: {
        title: "A Builder.io landing page looks ready, but accessibility and analytics were not verified.",
        prompt: "Ask: Did we define done clearly? Who owns accessibility, analytics, content, and final publish readiness? What checklist should exist before the next page goes live?"
      },
      crm: {
        title: "A Salesforce app request is done, but users say the workflow does not match reality.",
        prompt: "Ask: Did we understand the user mission? What assumptions did we make? Who owns discovery, UAT, release notes, and adoption feedback?"
      },
      email: {
        title: "A Marketing Cloud journey is delayed because segmentation, content, and QA owners were unclear.",
        prompt: "Ask: Where did the handoff break? What decision rights were unclear? What does the next launch need: owner map, deadline map, or QA gate?"
      },
      reporting: {
        title: "A dashboard is technically correct, but stakeholders do not trust the numbers.",
        prompt: "Ask: Did we explain metric definitions and lineage? Who owns stakeholder confidence? What validation and narrative should accompany the dashboard?"
      },
      prm: {
        title: "A physician relations report raises follow-up questions that were not captured in the original brief.",
        prompt: "Ask: Did we capture the actual decision the report needed to support? Who owns the follow-up loop? What intake question should be added?"
      }
    };

    const ownershipScenario = document.querySelector("#ownership-scenario");
    const ownershipGenerate = document.querySelector("#ownership-generate");
    const ownershipTitle = document.querySelector("#ownership-title");
    const ownershipPrompt = document.querySelector("#ownership-prompt");
    const ownershipScore = document.querySelector("#ownership-score");
    const ownershipRanges = document.querySelectorAll("#score-owner, #score-mission, #score-handoff");
    const commitmentKey = "claude-martech-ownership-commitments-v1";
    const commitmentName = document.querySelector("#commitment-name");
    const commitmentText = document.querySelector("#commitment-text");
    const saveCommitment = document.querySelector("#save-commitment");
    const commitmentBoard = document.querySelector("#commitment-board");

    function updateOwnershipExercise() {
      const selected = ownershipScenarios[ownershipScenario.value];
      ownershipTitle.textContent = selected.title;
      ownershipPrompt.textContent = selected.prompt;
    }

    function updateOwnershipScore() {
      const values = [...ownershipRanges].map((range) => Number(range.value));
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      ownershipScore.textContent = `Ownership readiness: ${average.toFixed(1)} / 5`;
    }

    function getCommitments() {
      return JSON.parse(localStorage.getItem(commitmentKey) || "[]");
    }

    function setCommitments(commitments) {
      localStorage.setItem(commitmentKey, JSON.stringify(commitments));
    }

    function renderCommitments() {
      const commitments = getCommitments();
      if (!commitments.length) {
        commitmentBoard.innerHTML = `<div class="commitment-item"><p>No commitments yet. Add one action you will own.</p></div>`;
        return;
      }
      commitmentBoard.innerHTML = commitments.map((item) => `
        <article class="commitment-item">
          <div class="question-meta"><span class="pill">Commitment</span><span>${escapeHTML(item.createdAt)}</span></div>
          <p><strong>${escapeHTML(item.name)}:</strong> ${escapeHTML(item.text)}</p>
        </article>
      `).join("");
    }

    if (ownershipScenario) {
    ownershipGenerate.addEventListener("click", updateOwnershipExercise);
    ownershipRanges.forEach((range) => range.addEventListener("input", updateOwnershipScore));
    saveCommitment.addEventListener("click", () => {
      const name = commitmentName.value.trim();
      const text = commitmentText.value.trim();
      if (!name || !text) {
        showToast("Add name and commitment");
        return;
      }
      const commitments = getCommitments();
      commitments.unshift({ name, text, createdAt: new Date().toLocaleString() });
      setCommitments(commitments);
      commitmentText.value = "";
      renderCommitments();
      showToast("Commitment added");
    });

    updateOwnershipExercise();
    updateOwnershipScore();
    renderCommitments();
    }

    const boardKey = "claude-martech-board-v1";
    const memberKey = "claude-martech-member-v1";
    let adminMode = false;

    const memberName = document.querySelector("#member-name");
    const memberRole = document.querySelector("#member-role");
    const memberStatus = document.querySelector("#member-status");
    const saveMember = document.querySelector("#save-member");
    const questionTopic = document.querySelector("#question-topic");
    const questionText = document.querySelector("#question-text");
    const submitQuestion = document.querySelector("#submit-question");
    const questionList = document.querySelector("#question-list");
    const toggleAdmin = document.querySelector("#toggle-admin");
    const exportBoard = document.querySelector("#export-board");

    function getMember() {
      return JSON.parse(localStorage.getItem(memberKey) || "null");
    }

    function setMember(member) {
      localStorage.setItem(memberKey, JSON.stringify(member));
    }

    function getQuestions() {
      return JSON.parse(localStorage.getItem(boardKey) || "[]");
    }

    function setQuestions(questions) {
      localStorage.setItem(boardKey, JSON.stringify(questions));
    }

    function escapeHTML(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function updateMemberUI() {
      const member = getMember();
      if (!member) return;
      memberName.value = member.name;
      memberRole.value = member.role;
      memberStatus.textContent = `Registered as ${member.name}${member.role ? ` (${member.role})` : ""}.`;
    }

    function renderQuestions() {
      const questions = getQuestions();
      if (!questions.length) {
        questionList.innerHTML = `<div class="question-item"><p>No questions yet. Register on the left and add the first one.</p></div>`;
        return;
      }

      questionList.innerHTML = questions.map((item) => {
        const statusClass = item.status === "Answered" ? "answered" : "open";
        const priority = item.priority ? `<span class="pill priority">Priority</span>` : "";
        const answer = item.answer ? `<p><strong>Admin response:</strong> ${escapeHTML(item.answer)}</p>` : "";
        const adminTools = adminMode ? `
          <div class="admin-tools active">
            <label for="answer-${item.id}">Admin response</label>
            <textarea id="answer-${item.id}" data-answer="${item.id}" placeholder="Write a response for the team...">${escapeHTML(item.answer || "")}</textarea>
            <div class="question-actions">
              <button class="btn small" data-admin-action="save" data-id="${item.id}" type="button">Save response</button>
              <button class="btn small secondary" data-admin-action="answered" data-id="${item.id}" type="button">Mark answered</button>
              <button class="btn small secondary" data-admin-action="priority" data-id="${item.id}" type="button">Toggle priority</button>
              <button class="btn small secondary" data-admin-action="delete" data-id="${item.id}" type="button">Delete</button>
            </div>
          </div>
        ` : "";

        return `
          <article class="question-item">
            <div class="question-meta">
              <span class="pill ${statusClass}">${escapeHTML(item.status)}</span>
              ${priority}
              <span>${escapeHTML(item.topic)}</span>
              <span>Asked by ${escapeHTML(item.name)}${item.role ? `, ${escapeHTML(item.role)}` : ""}</span>
              <span>${escapeHTML(item.createdAt)}</span>
            </div>
            <p>${escapeHTML(item.question)}</p>
            ${answer}
            ${adminTools}
          </article>
        `;
      }).join("");
    }

    if (submitQuestion) {
    saveMember.addEventListener("click", () => {
      const name = memberName.value.trim();
      const role = memberRole.value.trim();
      if (!name) {
        memberStatus.textContent = "Add your name to register.";
        return;
      }
      setMember({ name, role });
      updateMemberUI();
      showToast("Registered");
    });

    submitQuestion.addEventListener("click", () => {
      const member = getMember();
      const question = questionText.value.trim();
      if (!member) {
        memberStatus.textContent = "Register before submitting a question.";
        return;
      }
      if (!question) {
        showToast("Add a question first");
        return;
      }

      const questions = getQuestions();
      questions.unshift({
        id: Date.now().toString(36),
        name: member.name,
        role: member.role,
        topic: questionTopic.value,
        question,
        answer: "",
        status: "Open",
        priority: false,
        createdAt: new Date().toLocaleString()
      });
      setQuestions(questions);
      questionText.value = "";
      renderQuestions();
      showToast("Question submitted");
    });

    toggleAdmin.addEventListener("click", () => {
      if (!adminMode) {
        const passcode = window.prompt("Enter admin passcode");
        if (passcode !== "lead") {
          showToast("Admin mode locked");
          return;
        }
      }
      adminMode = !adminMode;
      toggleAdmin.textContent = adminMode ? "Exit admin" : "Admin mode";
      renderQuestions();
    });

    questionList.addEventListener("click", (event) => {
      const action = event.target.dataset.adminAction;
      const id = event.target.dataset.id;
      if (!action || !id) return;

      let questions = getQuestions();
      const item = questions.find((question) => question.id === id);
      if (!item) return;

      if (action === "save") {
        item.answer = document.querySelector(`[data-answer="${id}"]`).value.trim();
        item.status = item.answer ? "Answered" : item.status;
      }
      if (action === "answered") item.status = item.status === "Answered" ? "Open" : "Answered";
      if (action === "priority") item.priority = !item.priority;
      if (action === "delete") questions = questions.filter((question) => question.id !== id);

      setQuestions(questions);
      renderQuestions();
      showToast("Board updated");
    });

    exportBoard.addEventListener("click", () => {
      const rows = [["Created", "Name", "Role", "Topic", "Question", "Status", "Priority", "Admin response"]];
      getQuestions().forEach((item) => {
        rows.push([item.createdAt, item.name, item.role, item.topic, item.question, item.status, item.priority ? "Yes" : "No", item.answer || ""]);
      });
      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "claude-onboarding-questions.csv";
      link.click();
      URL.revokeObjectURL(url);
      showToast("CSV exported");
    });

    updateMemberUI();
    renderQuestions();
    }

    /* ===================== OH MarTech AI Challenge ===================== */
    (function () {
      const TRACKS = {
        web: { name: "Website & digital experience", tasks: [
          "Choose a real web workflow to improve (page QA, accessibility, SEO brief).",
          "Write the problem and who it helps in 2 sentences.",
          "Build a prompt or checklist with Claude/Copilot that produces the output.",
          "Test it on a real, staged page with no private data.",
          "Prepare a 2-minute showcase with a before/after."
        ]},
        content: { name: "Content & campaign strategy", tasks: [
          "Pick a content or campaign task that eats your time.",
          "Write the problem and the audience in 2 sentences.",
          "Build a prompt that drafts or repurposes the content.",
          "Test it on a real, approved source.",
          "Prepare a 2-minute showcase with a sample output."
        ]},
        analytics: { name: "Analytics & insights", tasks: [
          "Choose a recurring report or analysis question.",
          "Write the decision it should support in 2 sentences.",
          "Build a prompt that summarizes or explains the data.",
          "Test it on a real but de-identified dataset.",
          "Prepare a 2-minute showcase with the readout."
        ]},
        ops: { name: "Operations & automation", tasks: [
          "Pick an ops handoff or checklist that breaks often.",
          "Write the problem and the owners in 2 sentences.",
          "Build a checklist, tracker, or prompt that fixes it.",
          "Test it on a real launch or intake.",
          "Prepare a 2-minute showcase with the workflow."
        ]},
        tech: { name: "Technical innovation", tasks: [
          "Choose a small technical task (CSV cleanup, tracking audit, prototype).",
          "Write the problem and the success check in 2 sentences.",
          "Build it with Claude Code or Cowork: plan first, then implement.",
          "Test and verify it works on a safe example.",
          "Prepare a 2-minute showcase with the demo."
        ]}
      };

      const PKEY = "challenge-participants-v2";
      const MEKEY = "challenge-me-v2";
      const elName = document.getElementById("ch-name");
      const elRole = document.getElementById("ch-role");
      const elAvail = document.getElementById("ch-avail");
      const elTrack = document.getElementById("ch-track");
      const joinBtn = document.getElementById("ch-join");
      const assignment = document.getElementById("ch-assignment");
      const board = document.getElementById("ch-board");
      const exportBtn = document.getElementById("ch-export");
      if (!joinBtn || !assignment || !board) return;

      function getP() { try { return JSON.parse(localStorage.getItem(PKEY) || "[]"); } catch (e) { return []; } }
      function setP(arr) { localStorage.setItem(PKEY, JSON.stringify(arr)); }
      function meId() { return localStorage.getItem(MEKEY); }
      function pct(p) { const t = TRACKS[p.track]; return t ? Math.round(((p.done || []).length / t.tasks.length) * 100) : 0; }

      function renderAssignment() {
        const p = getP().find((x) => x.id === meId());
        if (!p || !TRACKS[p.track]) {
          assignment.innerHTML = '<p class="board-note" style="margin-top:12px">Sign up on the left and you\'ll get your track and a five-step task checklist to make your challenge real.</p>';
          return;
        }
        const t = TRACKS[p.track];
        const done = p.done || [];
        const tasks = t.tasks.map((task, i) =>
          '<li><label class="task-item"><input type="checkbox" data-i="' + i + '"' + (done.includes(i) ? " checked" : "") + '> <span>' + escapeHTML(task) + "</span></label></li>"
        ).join("");
        assignment.innerHTML =
          '<div class="assign-head"><h3 style="margin:8px 0 0">' + escapeHTML(t.name) + '</h3><span class="assign-pct">' + pct(p) + "% complete</span></div>" +
          '<p class="board-note" style="margin:6px 0 10px">Assigned to <strong>' + escapeHTML(p.name) + "</strong> · " + escapeHTML(p.availability) + '</p>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + pct(p) + '%"></div></div>' +
          '<ul class="task-list">' + tasks + "</ul>" +
          '<p class="board-note">Finish all five and you\'re showcase-ready. Tick them off as you go.</p>';
      }

      function renderBoard() {
        const ps = getP();
        if (!ps.length) {
          board.innerHTML = '<p class="board-note">No one has joined yet. Be the first to sign up.</p>';
          return;
        }
        board.innerHTML = ps.map((p) => {
          const t = TRACKS[p.track];
          const tn = t ? t.name : "—";
          const total = t ? t.tasks.length : 5;
          return '<article class="board-item">' +
            '<div class="board-item-head"><strong>' + escapeHTML(p.name) + '</strong><span class="pill">' + escapeHTML(tn) + "</span></div>" +
            '<p class="board-note" style="margin:4px 0 8px">' + escapeHTML(p.role || "—") + " · " + escapeHTML(p.availability) + " · joined " + escapeHTML(p.joinedAt || "") + "</p>" +
            '<div class="progress-track"><div class="progress-fill" style="width:' + pct(p) + '%"></div></div>' +
            '<span class="board-note">' + pct(p) + "% · " + ((p.done || []).length) + "/" + total + " tasks</span>" +
            "</article>";
        }).join("");
      }

      joinBtn.addEventListener("click", () => {
        const name = elName.value.trim();
        if (!name) { showToast("Add your name"); return; }
        const ps = getP();
        let p = ps.find((x) => x.id === meId());
        if (p) {
          p.name = name; p.role = elRole.value.trim(); p.availability = elAvail.value; p.track = elTrack.value;
          showToast("Updated your sign-up");
        } else {
          p = { id: Date.now().toString(36), name: name, role: elRole.value.trim(), availability: elAvail.value, track: elTrack.value, done: [], joinedAt: new Date().toLocaleDateString() };
          ps.unshift(p);
          localStorage.setItem(MEKEY, p.id);
          showToast("You're in! Tasks assigned below.");
        }
        setP(ps); renderAssignment(); renderBoard();
      });

      assignment.addEventListener("change", (e) => {
        const cb = e.target.closest("input[data-i]");
        if (!cb) return;
        const ps = getP();
        const p = ps.find((x) => x.id === meId());
        if (!p) return;
        const i = Number(cb.dataset.i);
        p.done = p.done || [];
        if (cb.checked) { if (!p.done.includes(i)) p.done.push(i); }
        else { p.done = p.done.filter((x) => x !== i); }
        setP(ps); renderAssignment(); renderBoard();
      });

      if (exportBtn) {
        exportBtn.addEventListener("click", () => {
          const rows = [["Name", "Role", "Availability", "Track", "Percent", "TasksDone"]];
          getP().forEach((p) => {
            const t = TRACKS[p.track];
            rows.push([p.name, p.role || "", p.availability, t ? t.name : "", pct(p) + "%", ((p.done || []).length) + "/" + (t ? t.tasks.length : 5)]);
          });
          const csv = rows.map((r) => r.map((c) => '"' + String(c).replaceAll('"', '""') + '"').join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "oh-martech-ai-challenge-participants.csv"; a.click();
          URL.revokeObjectURL(url);
          showToast("Participants exported");
        });
      }

      (function prefill() {
        const p = getP().find((x) => x.id === meId());
        if (p) {
          elName.value = p.name || "";
          elRole.value = p.role || "";
          if (p.availability) elAvail.value = p.availability;
          if (p.track) elTrack.value = p.track;
        }
      })();

      renderAssignment();
      renderBoard();
    })();
    /* ===================== Micro-video explainers ===================== */
    const videoScripts = {
      ch1: { secsPer: 5, lines: [
        "Leadership's hardest idea is also its most freeing: you own everything in your world.",
        "When something breaks, the best leaders look in the mirror first.",
        "Not to assign blame — but to find the one thing only they can change.",
        "Own the outcome, and the whole team rises with you."
      ]},
      ch2: { secsPer: 5, lines: [
        "There are no bad teams — only bad leaders.",
        "The standard you walk past is the standard you accept.",
        "So when a handoff keeps failing, fix the system, not the person.",
        "Set a bar the whole team can repeat — then hold it."
      ]},
      ch3: { secsPer: 5, lines: [
        "You can't sell a mission you don't believe in.",
        "If the why isn't clear, ask up the chain until it is.",
        "Then make it simple enough to explain to your own team.",
        "Belief is what carries the work through the hard days."
      ]},
      ch4: { secsPer: 5, lines: [
        "Ego is the quiet enemy of good decisions.",
        "It makes us stop listening, hide mistakes, and defend turf.",
        "Check it, and let the best idea win — whoever it comes from.",
        "The data and the customer matter more than being right."
      ]},
      ch5: { secsPer: 5, lines: [
        "No team wins alone.",
        "Cover and move means advancing the whole mission, not just your piece.",
        "Web, CRM, email, data, content — one team, one fight.",
        "Support the group beside you, and everyone moves faster."
      ]},
      ch6: { secsPer: 5, lines: [
        "Under pressure, complexity is the first thing to break.",
        "So simple plans win.",
        "Communicate so the most junior person can act without a meeting.",
        "If it isn't clear, it isn't done."
      ]},
      ch7: { secsPer: 5, lines: [
        "When everything's on fire, you can't fight every flame at once.",
        "Relax. Look around. Make a call.",
        "Pick the highest priority, execute it, then move to the next.",
        "Sequence beats scramble, every time."
      ]},
      ch8: { secsPer: 5, lines: [
        "No leader can make every decision.",
        "So push them to the people closest to the work.",
        "Give them the intent, the boundaries, and the goal.",
        "Then they can move without waiting on you."
      ]},
      ch9: { secsPer: 5, lines: [
        "A good plan turns chaos into a checklist.",
        "Define the mission, and name what could go wrong.",
        "Build the contingencies, and a way to roll back.",
        "Then brief it, so everyone knows their part."
      ]},
      ch10: { secsPer: 5, lines: [
        "Leadership flows in both directions.",
        "Down the chain: give your team the why and the support.",
        "Up the chain: bring information and a recommendation.",
        "Never make your leader guess what you need."
      ]},
      ch11: { secsPer: 5, lines: [
        "You will rarely have all the information.",
        "And waiting for certainty is a decision — usually the wrong one.",
        "Make the best call you can with what you have.",
        "Ship the reversible ones fast, then adjust as you learn."
      ]},
      ch12: { secsPer: 5, lines: [
        "Here's the paradox: discipline is what creates freedom.",
        "Checklists, reviews, and routines can feel restrictive.",
        "But they're what let a team move fast without breaking things.",
        "Build the habit, and speed becomes safe."
      ]},
      "uni-intro": { secsPer: 5, lines: [
        "Welcome to Martech AI University.",
        "A path you follow at your own pace — from foundations to technical mastery.",
        "Each module is short, practical, and ends with proof you can use.",
        "Finish the core path, and earn your certificate."
      ]},
      "uni-coach": { secsPer: 5, lines: [
        "Meet your University Coach.",
        "It helps you actually use Claude and Copilot for martech work.",
        "Ask how to write a prompt, pick the right tool, or tackle a lesson.",
        "A practice partner, ready whenever you are."
      ]}
    };

    const MV_ICONS = {
      play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
      replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.3"/><path d="M3 4v4h4"/></svg>',
      tiny: '<svg viewBox="0 0 24 24" fill="currentColor" style="width:11px;height:11px;animation:none"><path d="M8 5v14l11-7z"/></svg>',
      soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
      soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none"/><path d="M17 9l4 6M21 9l-4 6"/></svg>'
    };

    const mvSpeechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let mvAudioOn = localStorage.getItem("mv-audio") !== "off";
    const mvPlayers = [];
    const mvSoundButtons = [];

    function mvStopSpeech() {
      if (mvSpeechAvailable) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    }

    function mvSpeak(text) {
      if (!mvAudioOn || !mvSpeechAvailable) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.98;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    }

    function mvUpdateSoundButtons() {
      mvSoundButtons.forEach((btn) => {
        btn.innerHTML = mvAudioOn ? MV_ICONS.soundOn : MV_ICONS.soundOff;
        btn.classList.toggle("muted", !mvAudioOn);
        btn.setAttribute("aria-label", mvAudioOn ? "Mute narration" : "Unmute narration");
        btn.title = mvAudioOn ? "Narration on" : "Narration off";
      });
    }

    function mvFormat(totalSeconds) {
      const m = Math.floor(totalSeconds / 60);
      const s = Math.floor(totalSeconds % 60);
      return m + ":" + String(s).padStart(2, "0");
    }

    function setupPlayer(el, id) {
      const script = videoScripts[id];
      if (!script) return;
      const totalMs = script.lines.length * script.secsPer * 1000;
      el.classList.add("has-video");
      el.style.overflow = "hidden";

      const tag = document.createElement("span");
      tag.className = "mv-tag";
      tag.innerHTML = MV_ICONS.tiny + " " + mvFormat(totalMs / 1000) + " explainer";

      const playBtn = document.createElement("button");
      playBtn.className = "mv-play";
      playBtn.type = "button";
      playBtn.setAttribute("aria-label", "Play explainer");
      playBtn.innerHTML = MV_ICONS.play;

      const cap = document.createElement("div");
      cap.className = "mv-caption";

      const time = document.createElement("span");
      time.className = "mv-time";

      const bar = document.createElement("div");
      bar.className = "mv-bar";
      const fill = document.createElement("i");
      bar.appendChild(fill);

      const soundBtn = document.createElement("button");
      soundBtn.className = "mv-sound";
      soundBtn.type = "button";
      soundBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        mvAudioOn = !mvAudioOn;
        localStorage.setItem("mv-audio", mvAudioOn ? "on" : "off");
        mvUpdateSoundButtons();
        mvPlayers.forEach((p) => { if (p.setMuted) p.setMuted(!mvAudioOn); });
        if (!mvAudioOn) mvStopSpeech();
        else if (state.playing && !state.hasAudio) { state.lastSpoken = -1; render(); }
      });
      mvSoundButtons.push(soundBtn);

      el.appendChild(cap);
      el.appendChild(bar);
      el.appendChild(time);
      el.appendChild(tag);
      el.appendChild(soundBtn);
      el.appendChild(playBtn);

      const state = { playing: false, elapsed: 0, last: 0, raf: null, lastSpoken: -1, hasAudio: false };

      // Pre-recorded narration: audio/<id>.mp3 overrides the synthesized voice when present.
      const audioEl = new Audio();
      audioEl.preload = "metadata";
      audioEl.src = id + ".mp3";
      audioEl.addEventListener("loadedmetadata", () => {
        if (audioEl.duration && isFinite(audioEl.duration)) {
          state.hasAudio = true;
          tag.innerHTML = MV_ICONS.tiny + " " + mvFormat(audioEl.duration) + " explainer · voiced";
        }
      });
      audioEl.addEventListener("error", () => { state.hasAudio = false; });
      audioEl.addEventListener("ended", () => { if (state.hasAudio) end(); });

      function lineForProgress(progress) {
        return Math.max(0, Math.min(script.lines.length - 1, Math.floor(progress * script.lines.length)));
      }

      function render() {
        let progress, idx, curSec, totSec;
        if (state.hasAudio) {
          totSec = audioEl.duration || (totalMs / 1000);
          curSec = audioEl.currentTime;
          progress = totSec ? curSec / totSec : 0;
          idx = lineForProgress(progress);
        } else {
          totSec = totalMs / 1000;
          curSec = state.elapsed / 1000;
          progress = state.elapsed / totalMs;
          idx = Math.min(script.lines.length - 1, Math.floor(state.elapsed / (script.secsPer * 1000)));
        }
        cap.textContent = script.lines[idx];
        fill.style.width = Math.min(100, progress * 100) + "%";
        time.textContent = mvFormat(curSec) + " / " + mvFormat(totSec);
        if (!state.hasAudio && state.playing && idx !== state.lastSpoken) {
          state.lastSpoken = idx;
          mvSpeak(script.lines[idx]);
        }
      }

      function tick(ts) {
        if (!state.playing) return;
        if (state.hasAudio) {
          render();
          if (!audioEl.ended) state.raf = requestAnimationFrame(tick);
          return;
        }
        if (!state.last) state.last = ts;
        state.elapsed += ts - state.last;
        state.last = ts;
        if (state.elapsed >= totalMs) {
          state.elapsed = totalMs;
          render();
          end();
          return;
        }
        render();
        state.raf = requestAnimationFrame(tick);
      }

      function play() {
        mvPlayers.forEach((p) => { if (p.pause && p.el !== el) p.pause(); });
        mvStopSpeech();
        state.playing = true;
        state.last = 0;
        state.lastSpoken = -1;
        el.classList.remove("ended");
        el.classList.add("playing");
        playBtn.innerHTML = MV_ICONS.pause;
        playBtn.setAttribute("aria-label", "Pause explainer");
        if (state.hasAudio) {
          if (audioEl.ended || audioEl.currentTime >= (audioEl.duration || 0)) audioEl.currentTime = 0;
          audioEl.muted = !mvAudioOn;
          const pr = audioEl.play();
          if (pr && pr.catch) pr.catch(() => {});
        } else if (state.elapsed >= totalMs) {
          state.elapsed = 0;
        }
        render();
        state.raf = requestAnimationFrame(tick);
      }

      function pause() {
        if (!state.playing) return;
        state.playing = false;
        cancelAnimationFrame(state.raf);
        mvStopSpeech();
        if (state.hasAudio) audioEl.pause();
        el.classList.remove("playing");
        el.classList.add("ended");
        playBtn.innerHTML = MV_ICONS.play;
        playBtn.setAttribute("aria-label", "Resume explainer");
      }

      function end() {
        state.playing = false;
        cancelAnimationFrame(state.raf);
        mvStopSpeech();
        if (state.hasAudio) audioEl.pause();
        el.classList.remove("playing");
        el.classList.add("ended");
        playBtn.innerHTML = MV_ICONS.replay;
        playBtn.setAttribute("aria-label", "Replay explainer");
      }

      function setMuted(muted) {
        if (state.hasAudio) audioEl.muted = muted;
      }

      function toggle(e) {
        if (e) e.preventDefault();
        if (state.playing) pause();
        else play();
      }

      el.addEventListener("click", toggle);
      mvPlayers.push({ el: el, pause: pause, setMuted: setMuted });
    }

    function initVideos() {
      document.querySelectorAll(".chapter .chapter-art").forEach((art) => {
        const numEl = art.querySelector(".chapter-num i");
        if (!numEl) return;
        const id = "ch" + numEl.textContent.trim();
        setupPlayer(art, id);
      });
      document.querySelectorAll("[data-script]").forEach((el) => setupPlayer(el, el.dataset.script));
    }

    initVideos();
    mvUpdateSoundButtons();
    window.addEventListener("beforeunload", mvStopSpeech);

    /* ===================== Ownership Coach ===================== */
    const principles = [
      { key: "own", name: "Extreme Ownership", short: "1 · Extreme Ownership",
        keywords: ["extreme ownership", "own the outcome", "ownership", "mirror", "blame", "responsib"],
        explain: "You own everything in your world. When something goes wrong, look in the mirror first — then ask what you'll change. It's not self-blame; it's taking charge of what you can control.",
        example: "If a launch misses, the question isn't “who dropped this?” It's “what did I fail to clarify or verify, and what will I change?”",
        coach: "Situation: a campaign shipped with broken UTMs and no clear approver.\n• What could you have owned earlier in that chain?\n• Who owns the fix and the prevention step right now?",
        quiz: { q: "True or false — extreme ownership means blaming yourself for everything.", a: "False. It means taking responsibility for what you can control and changing the system, not self-blame or finding fault in others." } },
      { key: "team", name: "No Bad Teams, Only Bad Leaders", short: "2 · No Bad Teams",
        keywords: ["no bad teams", "bad leaders", "standard", "raise the bar", "tolerate"],
        explain: "There are no bad teams, only bad leaders. The standard you walk past is the standard you accept — performance follows the bar you set and hold.",
        example: "When a handoff keeps breaking, fix the standard and the checklist, not just the person.",
        coach: "Situation: the same QA mistake keeps recurring.\n• What standard have you been walking past?\n• What one-line standard could everyone repeat and hold?",
        quiz: { q: "What does “the standard you walk past is the standard you accept” mean for a recurring defect?", a: "If you tolerate it once without addressing it, you've made that the accepted bar. Name, raise, and hold the standard." } },
      { key: "believe", name: "Believe", short: "3 · Believe",
        keywords: ["believe", "mission", "why", "purpose", "buy in", "buy-in"],
        explain: "To lead others you must believe in the mission. If you don't understand the “why,” ask up the chain until you can explain it convincingly to your own team.",
        example: "Before executing a priority, be able to say why it matters to the patient or consumer and to the business.",
        coach: "Situation: you've been handed a priority you don't fully understand.\n• Who can you ask to clarify the why?\n• How would you explain that why to your team in two sentences?",
        quiz: { q: "What should you do if you don't understand or believe in a priority?", a: "Ask up the chain until you understand the why well enough to explain it convincingly — don't just pass doubt down to your team." } },
      { key: "ego", name: "Check the Ego", short: "4 · Check the Ego",
        keywords: ["ego", "check your ego", "humble", "humility", "defend", "right"],
        explain: "Ego clouds judgment. Confidence is good, but ego makes us stop listening and defend turf. Check it so the best answer can win.",
        example: "Data and user experience matter more than being right in the room.",
        coach: "Situation: your idea was challenged with better data.\n• What would checking your ego look like here?\n• What's one belief you'd be willing to test this month?",
        quiz: { q: "How do you know ego is getting in the way?", a: "You stop listening, hide mistakes, or defend your turf instead of pursuing the best outcome." } },
      { key: "cover", name: "Cover and Move", short: "5 · Cover & Move",
        keywords: ["cover and move", "cover & move", "teamwork", "silo", "together", "downstream"],
        explain: "Cover and move means teamwork — support the team next to you so the whole mission advances, not just your slice of it.",
        example: "Web, CRM, email, data, content, PRM, and leadership are one team. Optimize the whole journey, not one silo.",
        coach: "Situation: your part is done, but a partner team is stuck.\n• What would “cover and move” have you do?\n• What single thing would unblock them today?",
        quiz: { q: "What's the risk of optimizing only your own silo?", a: "You can “win” your piece while the overall mission fails. Teams have to move together." } },
      { key: "simple", name: "Simple", short: "6 · Simple",
        keywords: ["simple", "simplify", "clear", "complex", "complicated"],
        explain: "Simple plans win. Complexity compounds problems and complicated plans fall apart under pressure. Communicate so the most junior person can act.",
        example: "Write briefs and handoffs that anyone on the team can follow without a meeting.",
        coach: "Situation: your process doc needs three explanations to follow.\n• How would you simplify it so a new hire could execute it alone?\n• What can you cut?",
        quiz: { q: "Why simplify a plan?", a: "Complicated plans break down under pressure; simple, clear plans actually get executed correctly." } },
      { key: "prioritize", name: "Prioritize and Execute", short: "7 · Prioritize & Execute",
        keywords: ["prioritize", "execute", "priorities", "overwhelmed", "urgent", "fire"],
        explain: "When everything feels urgent: relax, look around, make a call. Do the highest priority first, communicate, then move to the next.",
        example: "When the queue is on fire, name the single top constraint, solve it, communicate the move, and repeat.",
        coach: "Situation: five things are “on fire” at once.\n• Which one, if solved, unblocks the most?\n• What will you do first, and what will you tell the team?",
        quiz: { q: "What's the first step when overwhelmed by competing priorities?", a: "Pause, determine the single highest priority, and execute it before moving on — don't try to do everything at once." } },
      { key: "decentral", name: "Decentralized Command", short: "8 · Decentralized Command",
        keywords: ["decentralized", "command", "delegate", "empower", "guardrail", "intent", "approve"],
        explain: "No leader can manage every detail. Push decisions to the people closest to the work, inside clear intent and known boundaries.",
        example: "Give owners commander's intent and guardrails so they can decide and move without waiting for a meeting.",
        coach: "Situation: your team waits on you for a routine decision.\n• What intent and guardrail would let them decide it themselves?\n• What's the first decision you could hand off?",
        quiz: { q: "What two things make decentralized command work?", a: "Clear commander's intent (the why and the goal) and known boundaries or guardrails." } },
      { key: "plan", name: "Plan", short: "9 · Plan",
        keywords: ["plan", "planning", "risk", "contingency", "rollback"],
        explain: "Good planning lowers risk: define the mission, name what could go wrong, build in contingencies, and brief everyone on their role and the standard.",
        example: "Every launch plan should name owners, the top risks, a clear definition of “done,” and a rollback path.",
        coach: "Situation: you're planning a launch.\n• What are the top three risks?\n• What's one contingency for each, and who owns the rollback?",
        quiz: { q: "What belongs in a good plan besides the steps?", a: "Risks, contingencies, a clear definition of done, named owners, and a briefing so everyone knows their role." } },
      { key: "leadupdown", name: "Leading Up and Down the Chain", short: "10 · Lead Up & Down",
        keywords: ["leading up", "lead up", "chain of command", "escalate", "up and down", "manage up"],
        explain: "Leadership flows both ways. Down the chain: give your team the why and the support. Up the chain: give leaders the information and a recommendation.",
        example: "If you need a decision or resource, bring the context and a recommendation — not just a problem.",
        coach: "Situation: you're blocked and need leadership to decide.\n• Draft three lines: the situation, the options, and your recommendation.\n• What does the leader need to say yes quickly?",
        quiz: { q: "What's the right way to escalate a blocker upward?", a: "Bring the situation, the options, and a clear recommendation — don't expect leaders to read your mind." } },
      { key: "decisive", name: "Decisiveness Amid Uncertainty", short: "11 · Decisiveness",
        keywords: ["decisive", "decisiveness", "uncertainty", "decision", "reversible", "delay"],
        explain: "There's rarely perfect information. Waiting for certainty is itself a decision — usually the wrong one. Make the best call you can, then adapt.",
        example: "Ship the reversible decision quickly; save long deliberation for the genuine one-way doors.",
        coach: "Situation: you've been delaying a decision waiting for more data.\n• Is it reversible?\n• If yes, what's stopping you from deciding today?",
        quiz: { q: "Is waiting for certainty a neutral choice?", a: "No — delay is a decision with consequences. Make the best call with available information and adjust as you learn." } },
      { key: "discipline", name: "Discipline Equals Freedom", short: "12 · Discipline = Freedom",
        keywords: ["discipline", "freedom", "habit", "routine", "checklist", "consistency"],
        explain: "Discipline — consistent standards, routines, and self-control — creates freedom. Habits like checklists and reviews buy speed and flexibility later.",
        example: "Standing QA checklists and honest after-action reviews free the team to move fast without breaking things.",
        coach: "Situation: pick one habit to build for 30 days.\n• Will it be a checklist or a weekly review?\n• When exactly will you do it, and how will you track it?",
        quiz: { q: "How does discipline create freedom?", a: "Consistent habits prevent fires and rework, which frees up time and flexibility later." } }
    ];

    const uniTopics = [
      { key: "start", name: "Getting started with Claude", short: "Getting started",
        keywords: ["start", "begin", "new", "getting started", "first", "how do i use"],
        explain: "Open Claude, describe your task in plain language, and ask for a specific output. Treat it like a sharp teammate: give the role, the context, and say what 'done' looks like.",
        example: "Try: \"Act as a marketing strategist. Draft a 5-bullet outline for a campaign update email to leadership. Context: [paste].\"",
        coach: "Pick one real task you'd normally start from a blank page.\n• Tell Claude the role, the goal, and the context.\n• Ask for the exact format you want.\n• Then refine: \"make it shorter, sharper, for executives.\"",
        quiz: { q: "What three things make a first prompt work?", a: "Role (who Claude should act as), goal (what you want), and context (the inputs) — plus the output format you need." } },
      { key: "prompt", name: "Prompt structure", short: "Prompt structure",
        keywords: ["prompt", "structure", "role", "format", "context", "constraint"],
        explain: "Strong prompts name the role, the goal, the context, the constraints, and the output format. The clearer the ask, the better the result.",
        example: "Template: \"Act as [role]. I need [goal] for [audience]. Context: [...]. Constraints: [...]. Return it as [format].\"",
        coach: "Take a weak prompt you've used.\n• Add a role and an audience.\n• Add the context it was missing.\n• Specify the format (bullets, table, 150 words).\nCompare the two results.",
        quiz: { q: "What's usually missing from a weak prompt?", a: "Context and a specified output format — without them the model has to guess." } },
      { key: "choose", name: "Claude vs Copilot vs Cowork", short: "Which tool to use",
        keywords: ["copilot", "cowork", "which tool", "claude vs", "difference", "when to use"],
        explain: "Use Claude chat for thinking and drafting; Microsoft Copilot for work that lives inside Outlook, Teams, Word, and Excel; and Cowork when Claude needs to work across the files in a folder.",
        example: "Rule of thumb: drafting and strategy → Claude; \"summarize this Teams thread\" → Copilot; \"review this folder of campaign files\" → Cowork.",
        coach: "Think of one task on your plate.\n• Is the content already in Microsoft 365? Lean Copilot.\n• Is it open-ended thinking or drafting? Lean Claude.\n• Does it span many files? Lean Cowork.",
        quiz: { q: "You need to summarize a long Teams meeting. Which tool?", a: "Microsoft Copilot — it already has the meeting context inside Teams." } },
      { key: "brief", name: "Writing a campaign brief", short: "Campaign brief",
        keywords: ["brief", "campaign brief", "intake"],
        explain: "Give Claude your messy notes plus a structure, and ask it to question you before drafting. You'll get a brief and the gaps you forgot.",
        example: "Lesson 1 in the track has the full copy-ready brief prompt — start there.",
        coach: "Grab real intake notes.\n• Paste them with the brief structure.\n• Answer Claude's clarifying questions.\n• Save the result as your reusable template.",
        quiz: { q: "Why ask Claude to question you first?", a: "It surfaces missing inputs — budget, dates, owners — before you commit to a draft." } },
      { key: "research", name: "Research and verification", short: "Research & verify",
        keywords: ["research", "summarize", "verify", "sources", "facts", "synthesis"],
        explain: "Claude is great at summarizing and finding themes, but you must verify facts. Ask it to separate findings from assumptions and flag weak evidence.",
        example: "Try: \"Summarize these notes; list findings, then separately list assumptions and anything I should verify.\"",
        coach: "Take a set of notes or a transcript.\n• Ask for findings, caveats, and next questions.\n• Check the caveats against what you know.\n• Verify any number before you share it.",
        quiz: { q: "What should you always do with Claude's research output?", a: "Verify the facts — treat it as a fast first draft, not a source of truth." } },
      { key: "deck", name: "Building a deck", short: "Build a deck",
        keywords: ["deck", "slides", "presentation", "powerpoint"],
        explain: "Ask for a slide-by-slide outline with takeaway headlines, bullets, a visual suggestion, and speaker notes — then refine it for your audience.",
        example: "Lesson 3 in the track has the copy-ready deck prompt.",
        coach: "Pick a real update.\n• Generate the 10-slide outline.\n• Rewrite each headline so it makes a point.\n• Ask for the 3 questions you should expect.",
        quiz: { q: "What makes a slide headline strong?", a: "It states the takeaway (a point), not just a topic label." } },
      { key: "artifact", name: "Reusable artifacts", short: "Reusable artifacts",
        keywords: ["artifact", "template", "reusable", "checklist"],
        explain: "Ask Claude to turn one good output into a reusable artifact — a checklist, one-pager, tracker, or template — with placeholders for next time.",
        example: "Try: \"Turn this into a reusable checklist template with placeholders the team can fill in.\"",
        coach: "Take something you do repeatedly.\n• Ask Claude to make it a template.\n• Add placeholders and short guidance.\n• Share it with the team.",
        quiz: { q: "Why build artifacts?", a: "They turn a one-off result into something the whole team can reuse, saving repeat effort." } },
      { key: "guardrails", name: "Responsible use and guardrails", short: "Guardrails",
        keywords: ["guardrail", "safe", "responsible", "sensitive", "privacy", "legal"],
        explain: "Don't paste sensitive or regulated data, always keep a human review step, and route legal or brand-sensitive content for approval. AI drafts; people decide.",
        example: "Before pasting, ask: \"would I email this to an outside vendor?\" If not, don't paste it.",
        coach: "Pick a real task.\n• Identify any sensitive data and remove it.\n• Decide who reviews the output.\n• Note where approval is required.",
        quiz: { q: "What's the rule for sensitive data?", a: "Don't paste it into AI tools; remove or anonymize it, and keep a human review and approval step." } },
      { key: "improve", name: "Improving an output", short: "Improve a draft",
        keywords: ["improve", "iterate", "rewrite", "better", "refine", "edit"],
        explain: "First drafts are a starting point. Tell Claude exactly how to improve it — clearer, shorter, more specific — and ask what it changed and why.",
        example: "Lesson 12 in the track has the copy-ready improvement prompt.",
        coach: "Take any draft.\n• Ask for clearer, more concise, and audience-fit.\n• Read the \"top 3 changes\" to learn the pattern.\n• Apply it yourself next time.",
        quiz: { q: "What's a good habit after Claude edits your draft?", a: "Read the list of changes it made and why — that's how you learn to write better yourself." } }
    ];

    function createCoach(opts) {
      const log = document.getElementById(opts.logId);
      const quick = document.getElementById(opts.quickId);
      const form = document.getElementById(opts.formId);
      const input = document.getElementById(opts.inputId);
      if (!log || !form) return;
      const topics = opts.topics;
      const plural = opts.subjectPlural || "topics";
      let topic = null, typing = null;

      function byKey(key) { return topics.find((t) => t.key === key); }
      function addMsg(html, who) {
        const d = document.createElement("div");
        d.className = "msg " + who;
        d.innerHTML = html;
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
      }
      function showTyping() {
        if (typing) return;
        typing = document.createElement("div");
        typing.className = "coach-typing";
        typing.innerHTML = "<span></span><span></span><span></span>";
        log.appendChild(typing);
        log.scrollTop = log.scrollHeight;
      }
      function hideTyping() { if (typing) { typing.remove(); typing = null; } }
      function chips(items) {
        quick.innerHTML = "";
        items.forEach((it) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "chip" + (it.alt ? " alt" : "");
          b.textContent = it.label;
          b.addEventListener("click", it.onClick);
          quick.appendChild(b);
        });
      }
      function say(html, c) {
        showTyping();
        setTimeout(() => { hideTyping(); addMsg(html, "bot"); if (c) chips(c); }, 460);
      }
      function topicItems() {
        const items = topics.map((p) => ({ label: p.short, onClick: () => pick(p.key) }));
        items.push({ label: "🎲 Surprise me", alt: true, onClick: () => pick(topics[Math.floor(Math.random() * topics.length)].key) });
        items.push({ label: "How this works", alt: true, onClick: howItWorks });
        return items;
      }
      function subItems() {
        return [
          { label: "Explain it", onClick: () => act("explain") },
          { label: opts.exampleLabel || "Give an example", onClick: () => act("example") },
          { label: opts.coachLabel || "Coach me", onClick: () => act("coach") },
          { label: "Quiz me", onClick: () => act("quiz") },
          { label: "← All " + plural, alt: true, onClick: topicMenu }
        ];
      }
      function topicMenu() { topic = null; say(opts.menuPrompt, topicItems()); }
      function howItWorks() { say(opts.help, topicItems()); }
      function pick(key) {
        const p = byKey(key);
        if (!p) return;
        topic = key;
        addMsg(escapeHTML(p.name), "user");
        say("<b>" + escapeHTML(p.name) + "</b><br>" + escapeHTML(p.explain), subItems());
      }
      function act(kind) {
        const p = byKey(topic);
        if (!p) { topicMenu(); return; }
        if (kind === "explain") say(escapeHTML(p.explain), subItems());
        else if (kind === "example") say("<b>" + (opts.exampleHeading || "Example:") + "</b> " + escapeHTML(p.example), subItems());
        else if (kind === "coach") say(escapeHTML(p.coach).replaceAll("\n", "<br>"), subItems());
        else if (kind === "quiz") say("<em>Quiz:</em> " + escapeHTML(p.quiz.q), [
          { label: "Reveal answer", onClick: () => say("<b>Answer:</b> " + escapeHTML(p.quiz.a), subItems()) },
          { label: "← All " + plural, alt: true, onClick: topicMenu }
        ]);
      }
      function handle(raw) {
        const text = raw.trim();
        if (!text) return;
        addMsg(escapeHTML(text), "user");
        const lower = text.toLowerCase();
        if (/(how.*work|help|what can you|menu)/.test(lower)) { howItWorks(); return; }
        const hit = topics.find((p) => p.keywords.some((k) => lower.includes(k)));
        if (hit) {
          topic = hit.key;
          if (lower.includes("example") || lower.includes("prompt")) act("example");
          else if (lower.includes("quiz")) act("quiz");
          else if (lower.includes("coach") || lower.includes("situation") || lower.includes("walk") || lower.includes("how do")) act("coach");
          else say("<b>" + escapeHTML(hit.name) + "</b><br>" + escapeHTML(hit.explain), subItems());
          return;
        }
        if (topic) {
          if (lower.includes("example") || lower.includes("prompt")) { act("example"); return; }
          if (lower.includes("quiz")) { act("quiz"); return; }
          if (lower.includes("coach") || lower.includes("situation") || lower.includes("walk")) { act("coach"); return; }
        }
        say(opts.fallback, topicItems());
      }
      form.addEventListener("submit", (e) => { e.preventDefault(); handle(input.value); input.value = ""; });
      say(opts.greeting, topicItems());
    }

    createCoach({
      logId: "coach-log", quickId: "coach-quick", formId: "coach-form", inputId: "coach-text",
      topics: principles, subjectPlural: "principles", exampleHeading: "On our team:",
      greeting: "Hi — I'm your Ownership Coach. I can help you understand and apply the 12 principles of Extreme Ownership. Where would you like to start?",
      menuPrompt: "Which principle next?",
      help: "I'm a guided coach for the 12 principles of Extreme Ownership. Tap a principle, or type a word like <b>ego</b>, <b>priorities</b>, or <b>plan</b>. For any principle I can <b>explain it</b>, give an <b>example</b>, <b>coach</b> you through a situation, or <b>quiz</b> you.",
      fallback: "I can coach you on any of the 12 principles. Pick one, or try a word like “ego,” “priorities,” or “plan.”"
    });

    createCoach({
      logId: "unicoach-log", quickId: "unicoach-quick", formId: "unicoach-form", inputId: "unicoach-text",
      topics: uniTopics, subjectPlural: "skills", exampleLabel: "Show the prompt", coachLabel: "Walk me through it", exampleHeading: "Try this:",
      greeting: "Hi — I'm your University Coach. I help you actually use Claude and Copilot for martech work. What do you want to do?",
      menuPrompt: "What skill next?",
      help: "I help with practical AI skills — picking the right tool, writing good prompts, and getting better results. Tap a skill, or type something like <b>brief</b>, <b>prompt</b>, or <b>Copilot</b>. For any skill I can <b>explain</b> it, show a <b>prompt</b>, <b>walk you through</b> it, or <b>quiz</b> you.",
      fallback: "I can help with using Claude and Copilot. Pick a skill, or try a word like “prompt,” “brief,” or “Copilot.”"
    });

    /* ===================== University lessons: copy + progress ===================== */
    document.querySelectorAll(".lcopy").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const card = btn.closest(".lesson2");
        const block = card && card.querySelector("[data-copy]");
        if (!block) return;
        const text = block.innerText;
        try {
          await navigator.clipboard.writeText(text);
          showToast("Copied prompt");
        } catch (e) {
          const ta = document.createElement("textarea");
          ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
          document.body.appendChild(ta); ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta);
          showToast(ok ? "Copied prompt" : "Copy failed");
        }
      });
    });

    (function () {
      const LKEY = "uni-lessons-done-v2";
      const toggles = [...document.querySelectorAll(".done-toggle input[data-lesson]")];
      const total = document.querySelectorAll(".lesson2").length || toggles.length;
      const ptext = document.getElementById("uni-progress-text");
      const pfill = document.getElementById("uni-progress-fill");
      function getDone() { try { return JSON.parse(localStorage.getItem(LKEY) || "[]"); } catch (e) { return []; } }
      function setDone(arr) { localStorage.setItem(LKEY, JSON.stringify(arr)); }
      function refresh() {
        const done = getDone();
        toggles.forEach((t) => {
          const on = done.includes(t.dataset.lesson);
          t.checked = on;
          const card = t.closest(".lesson2");
          if (card) card.classList.toggle("is-done", on);
        });
        const n = done.length;
        if (ptext) ptext.textContent = n + " of " + total + " lessons done";
        if (pfill) pfill.style.width = (total ? (n / total * 100) : 0) + "%";
      }
      toggles.forEach((t) => {
        t.addEventListener("change", () => {
          let done = getDone();
          const k = t.dataset.lesson;
          if (t.checked) { if (!done.includes(k)) done.push(k); }
          else { done = done.filter((x) => x !== k); }
          setDone(done); refresh();
        });
      });
      refresh();
    })();
