<template>
  <div>
    <div class="card" style="width: 18rem;">
      <img class="card-img-top" src="../assets/book.png" alt="Card image cap" />
      <div class="card-body">
        <h4 class="card-title">Price: {{ bookObject.price }}</h4>
        <h5 class="card-title">Name: {{ bookObject.name }}</h5>
        <p class="card-text">Description: {{ bookObject.description }}</p>
        <p class="card-text">Available: {{ bookObject.available }}</p>
        <button
          class="btn btn-primary btn-lg btn-block"
          v-on:click="toggleDetails"
        >
          View
        </button>
      </div>
    </div>
    <details-modal
      v-if="showModal"
      :bookData="bookObject"
      @canceled="toggleDetails"
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
    toggleDetails() {
      this.showModal = !this.showModal;
    }
  }
};
</script>
