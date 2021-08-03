function loadCsv() {
  return fetch("./data.csv").then((res) => res.text());
}

const KeyMap = {
  BILL_TYPE: 0,
  BILL_TIME: 1,
  BILL_CATEGORY: 2,
  BILL_AMOUNT: 3,
};

class CSV {
  /**
   * @constructor
   * @param {String} data
   */
  constructor(data) {
    try {
      this.handleData(data);
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   *
   * @param {Array<String>} record
   * @returns
   */
  createBillRecord(record) {
    return record;
  }

  /**
   *
   * @param {String} data
   * @returns {void}
   */
  handleData(data) {
    this._originData = data;
    this._data = data.split("\r\n");
    this._header = this._data[0].split(",");
    this._rows = this._data.slice(1).map((item) => item.split(","));
    console.log(this._header);
  }

  /**
   *
   * @param {Array<String>} record
   * @returns {void}
   */
  addRows(record) {
    this._rows.push(this.createBillRecord(record));
  }

  getRows() {
    return this._rows;
  }

  getHeader() {
    return this._header;
  }

  getOriginData() {
    return this._originData;
  }
}

class DataModel {
  constructor(data) {
    this.csv = new CSV(data);
  }

  filterByMonth(month) {
    const rows = this.csv.getRows();
    if (!month) {
      return rows;
    }
    return rows.filter((item) => {
      return new Date(Number(item[KeyMap.BILL_TIME])).getMonth() + 1 === month;
    });
  }

  calcIncomeAndOutcome(month) {
    return {
      income: (() => {
        let result = 0;
        this.filterByMonth(month).forEach((i) => {
          if (i[KeyMap.BILL_AMOUNT] >= 0) {
            result += Number(i[KeyMap.BILL_AMOUNT]);
          }
        });
        return result;
      })(),
      outcome: (() => {
        let result = 0;
        this.filterByMonth(month).forEach((i) => {
          if (i[KeyMap.BILL_AMOUNT] < 0) {
            result += Number(i[KeyMap.BILL_AMOUNT]);
          }
        });
        return result;
      })(),
    };
  }
}

class Controler {
  constructor(model, view) {
    this.$model = model;
    this.$view = view;
  }

  selectMonth(month) {
    this.$view.render(
      this.$model.csv.getHeader(),
      this.$model.filterByMonth(month),
      this.$model.calcIncomeAndOutcome(month)
    );
  }
}

class View {
  constructor(el, model) {
    this.$model = model;
    if (el instanceof String) {
      this.$el = document.getElementById(el);
    } else {
      this.$el = el;
    }
  }

  createTable(header, rows) {
    return `<table>${header}${rows}</table>`;
  }

  buildHeader(header) {
    return (
      `<thead>` +
      `<tr>` +
      header.map((item) => `<th>${item}</th>`) +
      `</tr>` +
      `</thead>`
    );
  }

  buildRows(rows) {
    return (
      `<tbody>` +
      rows.map((row) => {
        return `<tr>` + row.map((item) => `<td>` + item + `</td>`) + `</tr>`;
      }) +
      `</tbody>`
    );
  }

  render(header, rows, calcIncomeAndOutcomeData) {
    if (arguments.length === 0) {
      this.render(
        this.$model.csv.getHeader(),
        this.$model.csv.getRows(),
        this.$model.calcIncomeAndOutcome()
      );
      return;
    }
    let { income, outcome } = calcIncomeAndOutcomeData;
    this.$el.innerHTML = "";
    this.$el.innerHTML = `<div><p>Income:${income}</p> <p>Outcome:${-outcome}</p></div>`;
    this.$el.innerHTML += this.createTable(
      this.buildHeader(header),
      this.buildRows(rows)
    );
  }
}
