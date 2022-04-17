<template>
  <div>
    <button class="btn btn-primary float-right mt-2" @click="reloadList">
      Reload
    </button>
    <button class="btn btn-second float-right mt-2" @click="toggle">
      Add Book
    </button>
    <h1 class="title">Book List</h1>

    <div class="clearfix"></div>

    <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

    <h2 v-show="isLoading && bcConnected">Loading...</h2>
    <div class="row" v-show="!isLoading">
      <div class="m-3" v-for="book in books" v-bind:key="book.id">
        <card :bookObject="book" key="book.id" @reloadList="reloadList" />
      </div>
    </div>
    <book-form v-if="showModal" v-on:completed="addBookCompleted">
      <h3 slot="header">Rent Your Books</h3>
    </book-form>
  </div>
</template>

<script>
// importing common function
import mixin from "../libs/mixinViews";
import card from "../components/card.vue";
import bookForm from "../components/bookForm.vue";

/**
 * List view component: this component shows list of the registered books
 * and their statuses.
 */
export default {
  mixins: [mixin],

  components: {
    card,
    bookForm
  },

  data() {
    return {
      showModal: false,
      address: null,
      books: [], // array that stores all the registered books
      isLoading: true, // true when the book list is loading form the blockchain
      bcConnected: false, // blockchain is connected ()
      tmoConn: null // contain the intervalID given by setInterval
    };
  },

  methods: {
    addBookCompleted(txnInfo) {
      console.log(`txnInfo: ${JSON.stringify(txnInfo)}`);
      this.showModal = false;

      if (txnInfo.txnSubmissionTime) {
        const bookRentContract = window.bc.contract("Library");

        var lastTotal = -1;
        this.tmoConn = setInterval(() => {
          // checking first the connection
          if (this.blockchainIsConnected()) {
            bookRentContract.bookId((_err, total) => {
              var tot = -1;
              if (total) {
                tot = total.toNumber();
              }
              console.log(`totalBooks: ${tot}`);
              if (lastTotal >= 0 && tot > lastTotal) {
                const t1 = performance.now();
                console.log(
                  "addBook confirmation took " +
                    (t1 - txnInfo.txnSubmissionTime) +
                    " milliseconds."
                );
                clearInterval(this.tmoConn);
                this.reloadList();
              }
              lastTotal = tot;
            });
          }
        }, 500);
      }
    },
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

    toggle() {
      this.showModal = !this.showModal;
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
                  price: window.bc.weiToEther(book[3]),
                  owner: book[4],
                  address: this.address
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
    window.bc.getMainAccount().then(address => (this.address = address));

    // it tries to get the book list from the blockchain once
    // the connection is established
    this.tmoConn = setInterval(() => {
      this.getBookList();
    }, 1000);
  }
};
</script>

<style></style>
