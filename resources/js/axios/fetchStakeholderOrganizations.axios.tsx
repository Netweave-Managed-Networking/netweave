import axios from 'axios';

export async function fetchStakeholderOrganizations() {
  return (await axios.get(route('api.stakeholder-organizations.index'))).data;
}
