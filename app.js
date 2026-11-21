(function () {
  const stage = document.querySelector("#stage");
  const state = { outfit: null, reply: null, answer: null };
  let lock = false;

  function go(id) {
    if (lock) return;
    lock = true;
    stage.classList.add("is-out");
    window.setTimeout(function () {
      draw(id);
      stage.scrollTop = 0;
      stage.classList.remove("is-out");
      lock = false;
    }, 180);
  }

  function draw(id) {
    const scene = window.sceneById(id, state);
    stage.replaceChildren();
    if (scene.kicker) stage.append(el("p", "kicker", scene.kicker));

    if (scene.type === "call") drawCall(scene);
    else if (scene.type === "wardrobe") drawWardrobe(scene);
    else if (scene.type === "lines") drawLines(scene);
    else if (scene.type === "morning") drawMorning(scene);
    else drawProse(scene);

    if (scene.type === "call" && navigator.vibrate) navigator.vibrate(18);
  }

  function drawProse(scene) {
    if (scene.title) stage.append(el("h1", "", scene.title));
    if (scene.lead) stage.append(el("p", "lead", scene.lead));
    stage.append(blocks(scene.blocks));
    stage.append(dock(scene.cta || "Дальше", function () { go(scene.next); }));
  }

  function drawCall(scene) {
    const wrap = el("section", "call");
    wrap.append(el("div", "avatar", "С"));
    wrap.append(el("h2", "", scene.name));
    wrap.append(el("p", "status", scene.status));
    const button = el("button", "answer", scene.cta);
    button.type = "button";
    button.addEventListener("click", function () { go(scene.next); });
    wrap.append(button);
    stage.append(wrap);
  }

  function drawWardrobe(scene) {
    stage.append(el("h1", "", scene.prompt));
    const list = el("div", "choices");
    scene.options.forEach(function (option) {
      const button = el("button", "choice");
      button.type = "button";
      button.append(el("span", "cloth " + option.cloth, ""));
      const copy = el("span", "");
      copy.append(el("span", "name", option.name));
      copy.append(el("span", "note", option.note));
      button.append(copy);
      button.addEventListener("click", function () {
        Object.assign(state, option.set);
        go(option.next);
      });
      list.append(button);
    });
    stage.append(list);
  }

  function drawLines(scene) {
    stage.append(el("h1", "", scene.prompt));
    const list = el("div", "lines");
    scene.options.forEach(function (option) {
      const button = el("button", "line", option.text);
      button.type = "button";
      button.addEventListener("click", function () {
        Object.assign(state, option.set);
        go(option.next);
      });
      list.append(button);
    });
    stage.append(list);
  }

  function goal(name) {
    if (typeof ym === "function") ym(114415095, "reachGoal", name);
  }

  function drawMorning(scene) {
    goal("finished");
    stage.append(blocks(scene.blocks));
    const phone = el("section", "phone");
    const header = document.createElement("header");
    header.append(el("span", "", "Серёжа"));
    header.append(el("span", "", "08:47"));
    phone.append(header);
    const thread = el("div", "thread");
    thread.append(bubble("сегодня телефон у меня:) звони после обеда до 18"));
    phone.append(thread);

    const form = el("form", "composer");
    const draft = el("p", "draft", "Это был сон?");
    const send = el("button", "send", "Отправить");
    send.type = "submit";
    form.append(draft, send);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (thread.querySelector(".mine")) return;
      thread.append(bubble("Это был сон?", "нет сети", true));
      send.disabled = true;
      coda.hidden = false;
    });
    phone.append(form);
    stage.append(phone);

    const coda = el("p", "coda", "Сообщение не ушло. Вторая серия начнётся, когда он ответит.");
    coda.hidden = true;
    stage.append(coda);

    const next = el("button", "go next-episode", "Читать 2 серию");
    next.type = "button";
    next.addEventListener("click", function () {
      if (next.disabled) return;
      goal("episode2");
      next.disabled = true;
      next.textContent = "Вторая серия ещё пишется";
    });
    stage.append(next);

    const again = el("button", "again", "Сначала");
    again.type = "button";
    again.addEventListener("click", function () {
      state.outfit = null;
      state.reply = null;
      state.answer = null;
      go("open");
    });
    stage.append(again);
  }

  function bubble(text, meta, mine) {
    const node = el("div", mine ? "bubble mine" : "bubble");
    node.append(document.createTextNode(text));
    if (meta) node.append(el("span", "meta", meta));
    return node;
  }

  function blocks(list) {
    const wrap = el("div", "prose");
    list.forEach(function (block) {
      if (block.type === "say") {
        const say = el("div", "say");
        say.append(el("span", "who", block.who));
        say.append(el("p", "", block.text));
        wrap.append(say);
      } else {
        wrap.append(el("p", "", block.text));
      }
    });
    return wrap;
  }

  function dock(label, onClick) {
    const wrap = el("div", "dock");
    const button = el("button", "go", label);
    button.type = "button";
    button.addEventListener("click", onClick);
    wrap.append(button);
    return wrap;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  draw("open");
})();
