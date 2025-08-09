<template>
  <div class="container">
    <div class="header">
      <h1>Image Tools</h1>
      <p>Split images into grids and create printable standee sheets</p>
    </div>

    <div class="tab-container">
      <div class="tab-buttons">
        <router-link
          to="/map-split"
          class="tab-button"
          :class="{ active: $route.path === '/map-split' }"
        >
          <Map :size="16" class="tab-icon" />
          Map Split
        </router-link>
        <router-link
          to="/standee-creator"
          class="tab-button"
          :class="{ active: $route.path === '/standee-creator' }"
        >
          <SquareUserRound :size="16" class="tab-icon" />
          Standee Creator
        </router-link>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { Map, SquareUserRound } from 'lucide-vue-next';
</script>

<style scoped>
.container {
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
}

@media (max-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 1rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.header p {
  font-size: 1rem;
  opacity: 0.9;
}

.tab-container {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-buttons {
  display: flex;
  margin: 0 auto;
  padding: 0 10px;
}

@media (max-width: 1024px) {
  .tab-buttons {
    max-width: 1200px;
  }
}

.tab-button {
  padding: 16px 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-button:hover {
  color: #475569;
  background: #f1f5f9;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: white;
}

@media (max-width: 768px) {
  .tab-buttons {
    padding: 0 20px;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
}
</style>
