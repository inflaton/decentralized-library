<template>
  <div>
    <button class="btn btn-primary float-right mt-2" @click="reloadList">
      Reload
    </button>
    <h1 class="title">Book List</h1>

    <div class="clearfix"></div>

    <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

    <h2 v-show="isLoading && bcConnected">Loading...</h2>

    <table class="table table-striped" v-show="!isLoading">
      <thead class="thead-dark">
        <tr>
          <th>Book ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Address</th>
          <th>Created At</th>
          <th>Updated At</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books">
          <td>{{ book[0].toNumber() }}</td>
          <td>{{ book[1] }}</td>
          <td>{{ book[2] }}</td>
          <td>{{ book[3] }}</td>
          <td>{{ toDate(book[4].toNumber()) }}</td>
          <td>{{ toDate(book[5].toNumber()) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
// importing common function
import mixin from "../libs/mixinViews";

/**
 * List view component: this component shows list of the registered books
 * and their statuses.
 */
export default {
  mixins: [mixin],

  data() {
    return {
      books: [], // array that stores all the registered books
      isLoading: true, // true when the book list is loading form the blockchain
      bcConnected: false, // blockchain is connected ()
      tmoConn: null // contain the intervalID given by setInterval
    };
  },

  methods: {
    /**
     * Get the list of the registered books once the connection to the
     * blockchain is established.
     */
    getBookList() {
      if (this.blockchainIsConnected()) {
        // it shows the loading message
        this.isLoading = true;

        // stopping the interval
        clearInterval(this.tmoConn);

        // getting all the books from the blockchain
        this.getAllBooks(book => {
          this.isLoading = false;
          this.books.push(book);
        });
      }
    },

    /**
     * It reloads the book list.
     */
    reloadList() {
      this.books = [];

      this.getBookList();
    },

    /**
     * Get all books.
     */
    getAllBooks(callback) {
      // getting the total number of books stored in the blockchain
      // calling the method totalBooks from the smart contract
      window.bc.contract("Library").bookId((_err, total) => {
        var tot = 0;
        if (total) tot = total.toNumber();
        console.log(`totalBooks: ${tot}`);

        if (tot > 0) {
          // getting the book one by one
          for (var i = 1; i <= tot; i++) {
            window.bc.contract().getBookById.call(i, (error, book) => {
              callback(book);
            });
          } // end for
        } else {
          this.isLoading = false;
        }
      }); // end totalBooks call
    }
  }, // end methods

  created() {
    // it tries to get the book list from the blockchian once
    // the connection is established
    this.tmoConn = setInterval(() => {
      this.getBookList();
    }, 1000);
  }
};
</script>

<style></style>
