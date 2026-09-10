<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: string = 'text-gold-deep';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
</script>

<div class="flex items-center justify-center">
  <div class="{sizeClasses[size]} {color} border-[3px] border-current border-t-transparent" style="animation: brutSpin 0.7s steps(4) infinite;"></div>
</div>

<style>
  @keyframes brutSpin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
