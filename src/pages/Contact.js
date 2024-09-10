import React, { useState } from 'react';
import emailjs from 'emailjs-com'

function Contact() {
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

  const ValidateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  

  const sendEmail = (e) => {
    e.preventDefault();

    if(!ValidateEmail(formData)) {
      setStatusMessage('Please enter a valid email address.')
    }

  const serviceID = 'service_4pj4j9o';
  const templeteID = 'template_g5uomct';
  const userID = 'AgY0VxOvAb4APj0F9';

  emailjs.send(serviceID, templeteID, formData, userID)
  .then((result) => {
    console.log('Email sent successfully:', result.text);
    setStatusMessage('Email sent successfully!');
    setFormData({ email: '', message: '' });
  })
  .catch((error) => {
    console.error('Error sending email:', error);
    setStatusMessage('Failed to send email. Please try again.');
  });

}

  return (
    <>
      <section className="text-gray-600 body-font relative">
        <div className="absolute inset-0 bg-gray-300">
          <iframe
            width="100%"
            height="100%"
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3563.6707709375905!2d67.7782947746913!3d26.722962876760786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394a99d307de4303%3A0x5eb0d3239e21b16b!2sWeb%20Developers!5e0!3m2!1sen!2s!4v1725830586171!5m2!1sen!2s"
            allowFullScreen
          ></iframe>
        </div>
        <div className="container px-5 py-24 mx-auto flex">
          <form onSubmit={sendEmail} className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
            <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">Feedback</h2>
            <p className="leading-relaxed mb-5 text-gray-600">
            Reach out with your message and contact details, or connect with us on LinkedIn or Instagram.
            </p>
            <div className="relative mb-4">
              <label htmlFor="email" className="leading-7 text-sm text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder='Enter your email'
                required
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="message" className="leading-7 text-sm text-gray-600">
                Message
              </label>
              <textarea
                id='message'
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
              ></textarea>
            </div>
            <button className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" type='submit'>
              Button
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Let's Contact And Make a Deal to Grow your Business
            </p>
          </form>
          {statusMessage && <p className='mt-4 text-red-500'>{statusMessage}</p>}
        </div>
      </section>
    </>
  );
}

export default Contact;
