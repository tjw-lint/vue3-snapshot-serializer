<template>
  <div>
    <button
      data-test="toggle"
      @click="available = !available"
    >
      Toggle availability
    </button>
    <input v-model="available" />
    <input v-model="available" type="checkbox" />
    <h1 :title="{ available }">
      <template v-if="available">
        Available
      </template>
      <template v-else>
        Unavailable
      </template>
    </h1>
  </div>
</template>

<script>
export default {
  name: 'TestingLibrary',
  data: function () {
    return {
      available: true
    };
  }
};
</script>
