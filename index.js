function onLoadData(data) {
  const model = new DataModel(data);
  const view = new View(document.getElementById("table"), model);
  const controler = new Controler(model, view);
  view.render();
  window.controler = controler;
}

loadCsv().then((data) => {
  onLoadData(data);
});
