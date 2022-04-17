<template>
  <div>
    <button class="btn btn-primary float-right mt-2" @click="reloadList">
      Reload
    </button>
    <h1 class="title">Book List</h1>

    <div class="clearfix"></div>

    <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

    <h2 v-show="isLoading && bcConnected">Loading...</h2>
    <div class="row" v-show="!isLoading"></div>
    <div class="m-3" v-for="book in books" v-bind:key="book.id">
      <card :bookObject="book" key="book.id" />
    </div>
  </div>
</template>

<script>
// importing common function
import mixin from "../libs/mixinViews";
import card from "../components/card.vue";

/**
 * List view component: this component shows list of the registered books
 * and their statuses.
 */
export default {
  mixins: [mixin],

  components: {
    card
  },

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
      const bookRentContract = window.bc.contract("Library");
      // getting the total number of books stored in the blockchain
      // calling the method totalBooks from the smart contract
      bookRentContract.bookId((_err, total) => {
        var tot = 0;
        if (total) tot = total.toNumber();
        console.log(`totalBooks: ${tot}`);

        if (tot > 0) {
          // getting the book one by one
          for (var i = 0; i < tot; i++) {
            const id = i;
            bookRentContract.books.call(id, (_error, book) => {
              console.log(`book ${id}: ${JSON.stringify(book)}`);
              // filter the deleted books
              const name = book[0];
              if (name && name != "") {
                callback({
                  id,
                  name,
                  description: book[1],
                  available: book[2],
                  priceWei: book[3],
                  price: window.bc.weiToEther(book[3])
                });
              }
            });
          } // end for
        } else {
          this.isLoading = false;
        }
      }); // end totalBooks call
    }
  }, // end methods

  created() {
    // it tries to get the book list from the blockchain once
    // the connection is established
    this.tmoConn = setInterval(() => {
      this.getBookList();
    }, 1000);
  }
};
</script>

<style></style>
