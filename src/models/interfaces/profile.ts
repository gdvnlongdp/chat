interface IProfile {
  name: string;
  dob: Date;
  gender: "male" | "female";
  phone: string;
  avatar: string;
  background: string;
}

export default IProfile;
