import axios from 'axios';

export async function fetchStakeholderOrganizations() {
  return (await axios.get(route('stakeholder-organizations.api.index'))).data;
}
