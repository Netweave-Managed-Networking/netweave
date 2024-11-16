import axios from 'axios';

export async function fetchOrganizations() {
  return (await axios.get(route('organizations.api.index'))).data;
}
