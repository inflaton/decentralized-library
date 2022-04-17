<template>
  <div>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Books Details</h3>
          </div>
          <div class="modal-body">
            <slot name="body">
              <h3>Book Name: {{ bookData.name }}</h3>
              <h3>Price: {{ bookData.price }} ETH per day</h3>
              <p>Description: {{ bookData.description }}</p>
              <div
                v-if="bookData.available && userData.address != bookData.owner"
              >
                <div class="row ml-4 p-2">
                  <datepicker
                    :value="startDate"
                    v-model="startDate"
                  ></datepicker>
                  <datepicker v-model="endDate"></datepicker>
                </div>
                <button
                  class="btn btn-secondary btn-block"
                  v-on:click="borrowBook"
                >
                  Borrow Now
                </button>
              </div>
              <div v-else-if="userData.address == bookData.owner">
                <button
                  class="btn btn-danger btn-block"
                  v-on:click="deleteBook"
                >
                  Delete
                </button>
              </div>
              <button class="btn btn-warning btn-block" v-on:click="closeModal">
                Cancel
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";

export default {
  components: {
    Datepicker
  },
  props: ["bookData", "userData"],
  data() {
    return {
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    };
  },
  methods: {
    closeModal(e) {
      this.$emit("completed", {
        result: e.result || "cancelled",
        txnSubmissionTime: e.txnSubmissionTime,
        txHash: e.txHash,
        deleteBook: e.deleteBook
      });
    },
    getDayOfYear(date) {
      var now = new Date(date);
      var start = new Date(now.getFullYear(), 0, 0);
      var diff =
        now -
        start +
        (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
      var oneDay = 1000 * 60 * 60 * 24;
      return Math.floor(diff / oneDay);
    },
    borrowBook() {
      // get Start date
      const startDay = this.getDayOfYear(this.startDate);
      // get End date
      const endDay = this.getDayOfYear(this.endDate);
      // price calculation
      const value = this.bookData.priceWei * (endDay - startDay);

      const libraryContract = window.bc.contract("Library");
      const bookId = this.bookData.id;
      const startTime = Math.round(this.startDate.getTime() / 1000);
      const endTime = Math.round(this.endDate.getTime() / 1000);
      const address = this.userData.address;

      console.log(`bookId: ${bookId}`);
      console.log(`startTime: ${startTime}`);
      console.log(`endTime: ${endTime}`);
      console.log(`address: ${address}`);
      console.log(`value: ${value}`);

      const t0 = performance.now();
      // call borrowBook function of contract
      libraryContract.borrowBook(
        bookId,
        startTime,
        endTime,
        {
          from: address,
          gas: 800000,
          value
        },
        (error, txHash) => {
          const t1 = performance.now();
          console.log(`borrowBook error: ${error} txHash: ${txHash}`);
          console.log(
            "Call to borrowBook took " + (t1 - t0) + " milliseconds."
          );
          const txnSubmissionTime = error ? undefined : t1;
          this.closeModal({
            result: error ? "error" : "submitted",
            txnSubmissionTime,
            txHash
          });
        }
      );
    },
    deleteBook() {
      const libraryContract = window.bc.contract("Library");
      const bookId = this.bookData.id;
      const address = this.userData.address;

      console.log(`bookId: ${bookId}`);
      console.log(`address: ${address}`);

      const t0 = performance.now();
      // call deleteBook function of contract
      libraryContract.deleteBook(
        bookId,
        {
          from: address,
          gas: 800000
        },
        (error, txHash) => {
          const t1 = performance.now();
          console.log(`deleteBook error: ${error} txHash: ${txHash}`);
          console.log(
            "Call to deleteBook took " + (t1 - t0) + " milliseconds."
          );
          const txnSubmissionTime = error ? undefined : t1;
          this.closeModal({
            result: error ? "error" : "submitted",
            deleteBook: true,
            txnSubmissionTime,
            txHash
          });
        }
      );
    }
  }
};
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #c73318;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
