<template>
  <div>
    <input :value="first">
    <textarea v-model="second"></textarea>
    <input :value="third" type="number">
    <select v-model="selected">
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
    <button
      data-test="button"
      @click="first = '1st'"
    >
      Set First
    </button>
  </div>
</template>

<script>
export default {
  name: 'SeveralInputs',
  data: function () {
    return {
      first: 'first',
      second: 'second',
      third: 3,
      selected: 'b'
    }
  }
};
</script>
