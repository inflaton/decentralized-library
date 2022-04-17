<template>
  <div>
    <div class="card" style="width: 18rem;">
      <img class="card-img-top" src="../assets/book.png" alt="Card image cap" />
      <div class="card-body">
        <h4 class="card-title">Price: {{ bookObject.price }}</h4>
        <h5 class="card-title">Name: {{ bookObject.name }}</h5>
        <p class="card-text">Description: {{ bookObject.description }}</p>
        <p class="card-text">Available: {{ bookObject.available }}</p>
        <button class="btn btn-primary btn-lg btn-block" v-on:click="toggle">
          View
        </button>
      </div>
    </div>
    <details-modal
      v-if="showModal"
      :bookData="bookObject"
      @completed="borrowBookCompleted"
    >
    </details-modal>
  </div>
</template>

<script>
import DetailsModal from "../components/detailsModal.vue";

export default {
  props: ["bookObject"],
  data() {
    return {
      showModal: false
    };
  },
  components: {
    DetailsModal
  },
  methods: {
    toggle() {
      this.showModal = !this.showModal;
    },
    borrowBookCompleted(txnInfo) {
      this.toggle();
      console.log(`txnInfo: ${JSON.stringify(txnInfo)}`);

      if (txnInfo.txnSubmissionTime) {
        const bookRentContract = window.bc.contract("Library");
        const id = this.bookObject.id;

        this.tmoConn = setInterval(() => {
          // checking first the connection
          bookRentContract.books.call(id, (_error, book) => {
            console.log(`book ${id}: ${JSON.stringify(book)}`);
            let done;
            if (txnInfo.deleteBook) {
              done = !book[0] || book[0] == "";
            } else {
              done = !book[2];
            }

            // filter the deleted books
            if (done) {
              const t1 = performance.now();
              console.log(
                `${
                  txnInfo.deleteBook ? "deleteBook" : "borrowBook"
                } confirmation took ${(t1 - txnInfo.txnSubmissionTime) /
                  1000} seconds.`
              );
              clearInterval(this.tmoConn);
              this.$emit("reloadList");
            }
          });
        }, 500);
      }
    }
  }
};
</script>
