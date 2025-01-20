<template>
  <div>
    <input v-model="on" type="checkbox">
    <input v-model="off" type="checkbox">
    <fieldset>
      <input v-model="animal" type="radio" name="animal" value="cat">
      <input v-model="animal" type="radio" name="animal" value="cow">
      <input v-model="animal" type="radio" name="animal" value="dog">
    </fieldset>
  </div>
</template>

<script>
export default {
  name: 'CheckboxesAndRadios',
  data: function () {
    return {
      on: true,
      off: false,
      animal: 'cow'
    };
  }
};
</script>
