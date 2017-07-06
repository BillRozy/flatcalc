var Items = {};

var db = null;

Vue.component('dynamic-table', {
  template: `
    <table class="table is-striped">
      <thead>
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
      </thead>
      <tbody>
        <editable-row v-for="item in items" :opt="item" @desire-to-delete="deleteItem"></editable-row>
        <tr>
          <th>

          </th>
          <th>

          </th>
          <th>
            {{sum}}
          </th>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <input class="input-transformer" v-model="label" type="text" placeholder="Наименование">
          </td>
          <td>
            <input class="input-transformer" v-model="link" type="url" placeholder="Линк/пруф">
          </td>
          <td>
            <input class="input-transformer" v-model="price" type="number" min="0" placeholder="Цена">
          </td>
          <td>
            <a @click="saveItem" class="button is-outlined is-primary">
              Add
            </a>
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
      price: ''
    }
  },

  computed: {
    sum: function() {
      let sum = 0;
      for(let item in this.items){
        if(this.items.hasOwnProperty(item)){
          sum += parseFloat(this.items[item].price);
        }
      }
      return sum;
    }
  },

  methods: {
    saveItem: function() {
      if(this.validate()){
        var self = this;
        db.transaction(function(tx) {
          let time = new Date().getTime();
          tx.executeSql("INSERT INTO Items (label, proofs, price, timestamp) values(?, ?, ?, ?)", [self.label, self.link, self.price ,time], function(tx, res) {
            console.log(res);
            self.$set(Items, res.insertId, {
              id: res.insertId,
              label: self.label,
              proofs: self.link,
              price: self.price,
              timestamp: time
            });
          }, null);
        });
      } else{
        alert("Проверьте поля ввода!")
      }
    },

    deleteItem: function(id) {
      var self = this;
      db.transaction(function(tx) {
        tx.executeSql('DELETE FROM Items WHERE id = ?', [id], function(tx, res) {
          console.log(res);
          self.$delete(Items, id);
        }, null);
      });
    },

    validate: function() {
       return this.label != '' && this.link != '' && this.price != '';
    }
  },

  mounted: function(){
      var self = this;
      db = openDatabase("Items", "0.1", "A list of  items.", 2000);
      if(!db){
        alert("Failed to connect to database.");
      } else{
        db.transaction(function(tx) {
          tx.executeSql("SELECT * FROM Items", [],
          function (tx, result) {
            for(var i = 0; i < result.rows.length; i++) {
              self.$set(Items, result.rows.item(i).id, result.rows.item(i));
            }
           },
          function (tx, error) {
            tx.executeSql("CREATE TABLE Items (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT, proofs TEXT, price REAL ,timestamp REAL)", [], null, null);
          })
        });
      }
  },

  components: {
    EditRow: Vue.component('editable-row', {
      template: `
        <tr>
          <td>
            <input class="input-transformer" type="text" v-model="item.label" :readonly="!inEditMode">
          </td>
          <td>
            <input :class="{invisible: !inEditMode}" class="input-transformer" type="url" v-model="item.proofs" :readonly="!inEditMode">
            <a :href="item.proofs" :class="{invisible: inEditMode}" target="_blank">{{item.proofs}}</a>
          </td>
          <td>
            <input class="input-transformer" type="number" min="0" step="100" v-model="item.price" :readonly="!inEditMode">
          </td>
          <td>
            <a @click="edit" class="button is-primary" :class="{'is-outlined': !inEditMode}">
              Edit
            </a>
            <a class="button is-danger is-outlined" @click="deleteNotify">
              Del
            </a>
          </td>
        </tr>
      `,

      props: ['opt'],

      methods: {
        edit: function() {
          var self = this;
          if(this.inEditMode){
            if(!db){
              alert("Failed to connect to database.");
            } else{
              db.transaction(function(tx) {
                tx.executeSql("UPDATE Items SET label=?, proofs=?, price=? WHERE id=?", [self.item.label, self.item.proofs, self.item.price, self.item.id], function(tx, res) {
                  console.log(res);
                }, null);
              });
            }
          }
          this.inEditMode = !this.inEditMode;
        },

        deleteNotify: function() {
          this.$emit('desire-to-delete', this.item.id);
        }
      },

      data: function() {
        return {
          item: this.opt,
          inEditMode: false
        }
      }
    })
  }


});
