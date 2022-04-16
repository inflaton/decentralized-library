import Vue from 'vue';
import Router from 'vue-router';
import Profile from '@/views/Profile';
import Register from '@/views/Register';
import UserList from '@/views/UserList';
import BookList from '@/views/BookList';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'BookList',
      component: BookList
    },
    {
      path: '/users',
      name: 'UserList',
      component: UserList
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
  ],
  linkActiveClass: 'active'
});
