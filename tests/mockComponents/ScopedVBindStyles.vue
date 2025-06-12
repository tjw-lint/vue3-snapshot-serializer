<template>
  <div>
    <span
      class="example"
      style="--padding-size: 10px; padding: var(--padding-size);"
    >
      Text
    </span>
  </div>
</template>

<script>
export default {
  name: 'ScopedVBindStyles',
  data: function () {
    return {
      color: '#FF0000',
      pageWidth: '800px'
    };
  }
};
</script>

<style scoped>
.example {
  background: v-bind(color);
  width: v-bind(pageWidth);
  padding: 10px;
}
</style>
