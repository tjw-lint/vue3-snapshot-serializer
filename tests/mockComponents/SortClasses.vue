<template>
  <div>
    <h1 class="meow cat nyan kitten">
      fluffy
    </h1>
    <h2 class="kitten2" :class="qwer">
      mittens
    </h2>
    <h3 class="kitten3">
      scruffy
    </h3>
    <h4>
      lucy
    </h4>
  </div>
</template>

<script>
export default {
  name: 'SortClasses',
  data: function () {
    return {
      qwer: 'qwer'
    };
  }
};
</script>
