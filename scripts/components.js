var Items = [];

Vue.component('dynamic-table', {
  template: `
    <table class="table is-striped">
      <thead>

      </thead>
      <tbody>
        <tr>
          <th>
            Наименование
          </th>
          <th>
            Линк/пруф
          </th>
          <th>
            Цена
          </th>
        </tr>

        <tr v-for="item in items">
          <td>
            {{item.label}}
          </td>
          <td>
            {{item.proofs}}
          </td>
          <td>
            {{item.price}}
          </td>
          <td>
            edit
          </td>
          <td>
            X
          </td>
        </tr>

      </tbody>
      <tfoot>
        <tr>
          <td>
            <input v-model="label" type="text" placeholder="Наименование">
          </td>
          <td>
            <input v-model="link" type="text" placeholder="Линк/пруф">
          </td>
          <td>
            <input v-model="price" type="text" placeholder="Цена">
          </td>
          <td>
            <input type="button" value="+" @click="saveItem">
          </td>
        </tr>
      </tfoot>
    </table>
  `,

  data: function(){
    return {
      items: Items,
      label: '',
      link: '',
      price: '',
      db: null
    }
  },

  methods: {
    saveItem: function() {
      var self = this;
      this.db.transaction(function(tx) {
        let time = new Date().getTime();
        tx.executeSql("INSERT INTO Items (label, proofs, price, timestamp) values(?, ?, ?, ?)", [self.label, self.link, self.price ,time], function(tx, res) {
          console.log(res);
          Items.push({
            id: res.insertId,
            label: self.label,
            proofs: self.link,
            price: self.price,
            timestamp: time
          })
        }, null);
      });
    }
  },

  mounted: function(){
      this.db = openDatabase("Items", "0.1", "A list of  items.", 2000);
      if(!this.db){
        alert("Failed to connect to database.");
      } else{
        this.db.transaction(function(tx) {
          tx.executeSql("SELECT * FROM Items", [],
          function (tx, result) {
            for(var i = 0; i < result.rows.length; i++) {
              Items.push(result.rows.item(i));
            }
           },
          function (tx, error) {
            tx.executeSql("CREATE TABLE Items (id REAL UNIQUE, label TEXT, proofs TEXT, price REAL ,timestamp REAL)", [], null, null);
          })
        });
      }
  },


});
