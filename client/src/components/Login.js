import React, {useCallback, useContext, useEffect} from 'react';
import { useForm } from 'react-hook-form';
import Content from '../common/Content';
import Input from '../common/Input';
import Button from '../common/Button';
import {appContext} from "../context/app";

const Login = () => {
  const { api } = useContext(appContext);
  const { handleSubmit, register, errors } = useForm({
    defaultValues: {
      mailingList: true,
    },
  });

  // eslint-disable-next-line no-console
  const onSubmit = useCallback(values => console.log(values), []);

  return (
    <Content title="Log in" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="email"
          name="email"
          placeholder="Your email address"
          title="Email"
          error={errors.email}
          useRef={register({
            required: 'Required',
            pattern: {
              value: /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          type="password"
          name="password"
          placeholder="Super strong password"
          title="Password"
          error={errors.password}
          useRef={register({
            required: 'Required',
            pattern: {
              value: /^(?=.*[a-z])(?=.*[^a-z]).{8,}$/i,
              message:
                'Your password should contain letters and special characters or digits & 8 characters min',
            },
          })}
        />

        <Button primary type="submit">
          Submit
        </Button>
      </form>
    </Content>
  );
};

export default Login;
